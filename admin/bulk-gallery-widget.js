(function () {

    const BulkGalleryControl = function (props) {

        const storeAvailable =
            typeof CMS.getStore === "function";

        return h(
            "div",
            {
                style: {
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fafafa"
                }
            },
            [

                h(
                    "strong",
                    {},
                    "VELNORA Bulk Gallery"
                ),

                h(
                    "p",
                    {
                        style: {
                            marginTop: "10px"
                        }
                    },
                    storeAvailable
                        ? "Media-library connection available."
                        : "Media-library connection not available."
                )

            ]
        );

    };


    CMS.registerWidget(
        "bulk-gallery",
        BulkGalleryControl
    );

})();
(function () {

    const API_BASE = "/.netlify/git/github";

    const MEDIA_FOLDER = "images/uploads";

    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB


    /* =========================
       HELPERS
    ========================= */

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function sanitizeFilename(name) {

        const parts = name.split(".");

        const extension =
            parts.length > 1
                ? "." + parts.pop().toLowerCase()
                : "";

        const base =
            parts.join(".")
                .replace(/[^\w\-]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase();

        return (base || "image") + extension;

    }


    function uniquePath(filename, usedPaths) {

        const dotIndex = filename.lastIndexOf(".");

        const base =
            dotIndex > 0
                ? filename.substring(0, dotIndex)
                : filename;

        const extension =
            dotIndex > 0
                ? filename.substring(dotIndex)
                : "";

        let candidate =
            `${MEDIA_FOLDER}/${filename}`;

        let number = 2;

        while (usedPaths.has(candidate)) {

            candidate =
                `${MEDIA_FOLDER}/${base}-${number}${extension}`;

            number++;

        }

        usedPaths.add(candidate);

        return candidate;

    }


    async function fileToBase64(file) {

        const buffer =
            await file.arrayBuffer();

        const bytes =
            new Uint8Array(buffer);

        const chunkSize = 0x8000;

        let binary = "";

        for (
            let i = 0;
            i < bytes.length;
            i += chunkSize
        ) {

            const chunk =
                bytes.subarray(
                    i,
                    Math.min(
                        i + chunkSize,
                        bytes.length
                    )
                );

            binary += String.fromCharCode(...chunk);

        }

        return btoa(binary);

    }


    async function apiRequest(
        path,
        token,
        options = {}
    ) {

        const response =
            await fetch(
                API_BASE + path,
                {
                    ...options,

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`,

                        ...(options.headers || {})
                    }
                }
            );


        const text =
            await response.text();


        let data;

        try {
            data = text
                ? JSON.parse(text)
                : null;
        }

        catch {
            data = text;
        }


        if (!response.ok) {

            const message =
                data?.message ||
                data?.error ||
                text ||
                `HTTP ${response.status}`;

            throw new Error(
                `${response.status}: ${message}`
            );

        }


        return data;

    }


    /* =========================
       GET CURRENT MAIN
    ========================= */

    async function getCurrentBranch(token) {

        return apiRequest(
            "/git/refs/heads/main",
            token
        );

    }


    /* =========================
       GET CURRENT TREE
    ========================= */

    async function getTree(
        token,
        treeSha
    ) {

        return apiRequest(
            `/git/trees/${treeSha}?recursive=1`,
            token
        );

    }


    /* =========================
       CREATE BLOB
    ========================= */

    async function createBlob(
        token,
        base64
    ) {

        return apiRequest(
            "/git/blobs",
            token,
            {
                method: "POST",

                body: JSON.stringify({

                    content: base64,

                    encoding: "base64"

                })

            }
        );

    }


    /* =========================
       CREATE TREE
    ========================= */

    async function createTree(
        token,
        baseTree,
        entries
    ) {

        return apiRequest(
            "/git/trees",
            token,
            {
                method: "POST",

                body: JSON.stringify({

                    base_tree: baseTree,

                    tree: entries

                })

            }
        );

    }


    /* =========================
       CREATE COMMIT
    ========================= */

    async function createCommit(
        token,
        treeSha,
        parentSha
    ) {

        return apiRequest(
            "/git/commits",
            token,
            {
                method: "POST",

                body: JSON.stringify({

                    message:
                        "Upload gallery images",

                    tree:
                        treeSha,

                    parents: [
                        parentSha
                    ]

                })

            }
        );

    }


    /* =========================
       UPDATE MAIN
    ========================= */

    async function updateMain(
        token,
        commitSha
    ) {

        return apiRequest(
            "/git/refs/heads/main",
            token,
            {
                method: "PATCH",

                body: JSON.stringify({

                    sha: commitSha,

                    force: false

                })

            }
        );

    }


    /* =========================
       UPLOAD BATCH
    ========================= */

    async function uploadImages(
        files,
        setStatus
    ) {

        const user =
            netlifyIdentity.currentUser();


        if (!user) {

            throw new Error(
                "You are not logged into Netlify Identity."
            );

        }


        const token =
            await user.jwt();


        setStatus(
            "Checking repository..."
        );


        const branch =
            await getCurrentBranch(token);


        const parentSha =
            branch.object.sha;


        const commit =
            await apiRequest(
                `/git/commits/${parentSha}`,
                token
            );


        const baseTree =
            commit.tree.sha;


        const tree =
            await getTree(
                token,
                baseTree
            );


        const usedPaths =
            new Set(
                (tree.tree || [])
                    .map(item => item.path)
                    .filter(Boolean)
            );


        const treeEntries = [];

        const uploadedPaths = [];


        for (
            let index = 0;
            index < files.length;
            index++
        ) {

            const file =
                files[index];


            if (
                file.size >
                MAX_FILE_SIZE
            ) {

                throw new Error(
                    `"${file.name}" is larger than 25 MB.`
                );

            }


            if (
                !file.type.startsWith("image/")
            ) {

                throw new Error(
                    `"${file.name}" is not an image.`
                );

            }


            const filename =
                sanitizeFilename(
                    file.name
                );


            const path =
                uniquePath(
                    filename,
                    usedPaths
                );


            setStatus(
                `Uploading ${index + 1} of ${files.length}: ${file.name}`
            );


            const base64 =
                await fileToBase64(file);


            const blob =
                await createBlob(
                    token,
                    base64
                );


            treeEntries.push({

                path,

                mode: "100644",

                type: "blob",

                sha: blob.sha

            });


            uploadedPaths.push(
                "/" + path
            );

        }


        setStatus(
            "Creating gallery image commit..."
        );


        const newTree =
            await createTree(
                token,
                baseTree,
                treeEntries
            );


        const newCommit =
            await createCommit(
                token,
                newTree.sha,
                parentSha
            );


        setStatus(
            "Updating main branch..."
        );


        await updateMain(
            token,
            newCommit.sha
        );


        setStatus(
            `${uploadedPaths.length} image${uploadedPaths.length === 1 ? "" : "s"} uploaded successfully.`
        );


        return uploadedPaths;

    }


    /* =========================
       CUSTOM WIDGET
    ========================= */

    const BulkGalleryControl =
        createClass({

            getInitialState: function () {

                return {

                    uploading: false,

                    status: "",

                    previews: []

                };

            },


            handleFiles: async function (event) {

                const input =
                    event.target;


                const files =
                    Array.from(
                        input.files || []
                    );


                if (!files.length) {
                    return;
                }


                if (this.state.uploading) {
                    return;
                }


                this.setState({

                    uploading: true,

                    status:
                        `Preparing ${files.length} image${files.length === 1 ? "" : "s"}...`

                });


                const previews =
                    files.map(file => ({

                        name: file.name,

                        url:
                            URL.createObjectURL(file)

                    }));


                this.setState({
                    previews
                });


                try {

                    const paths =
                        await uploadImages(
                            files,
                            status => {

                                this.setState({
                                    status
                                });

                            }
                        );


                    const currentValue =
                        Array.isArray(
                            this.props.value
                        )
                            ? this.props.value
                            : [];


                    this.props.onChange(
                        currentValue.concat(
                            paths
                        )
                    );


                    this.setState({

                        uploading: false,

                        status:
                            `${paths.length} image${paths.length === 1 ? "" : "s"} added to this album.`

                    });

                }


                catch (error) {

                    console.error(
                        "VELNORA Bulk Gallery Error:",
                        error
                    );


                    this.setState({

                        uploading: false,

                        status:
                            `Upload failed: ${error.message}`

                    });

                }


                input.value = "";

            },


            removeImage: function (index) {

                const currentValue =
                    Array.isArray(
                        this.props.value
                    )
                        ? this.props.value
                        : [];


                const nextValue =
                    currentValue.filter(
                        (_, i) => i !== index
                    );


                this.props.onChange(
                    nextValue
                );

            },


            render: function () {

                const value =
                    Array.isArray(
                        this.props.value
                    )
                        ? this.props.value
                        : [];


                return h(
                    "div",
                    {
                        style: {

                            border:
                                "1px solid #ddd",

                            borderRadius:
                                "10px",

                            padding:
                                "16px",

                            background:
                                "#fafafa"

                        }
                    },

                    [

                        h(
                            "input",
                            {

                                id:
                                    this.props.forID,

                                type:
                                    "file",

                                accept:
                                    "image/*",

                                multiple:
                                    true,

                                disabled:
                                    this.state.uploading,

                                onChange:
                                    this.handleFiles,

                                style:
                                    {
                                        display:
                                            "none"
                                    }

                            }
                        ),


                        h(
                            "label",
                            {

                                htmlFor:
                                    this.props.forID,

                                style: {

                                    display:
                                        "block",

                                    padding:
                                        "18px",

                                    textAlign:
                                        "center",

                                    border:
                                        "2px dashed #bbb",

                                    borderRadius:
                                        "8px",

                                    cursor:
                                        this.state.uploading
                                            ? "wait"
                                            : "pointer",

                                    background:
                                        "#fff"

                                }

                            },

                            this.state.uploading

                                ? "Uploading..."

                                : "📁 Upload Images"

                        ),


                        this.state.status

                            ? h(
                                "p",
                                {
                                    style: {
                                        margin:
                                            "12px 0 0",
                                        fontSize:
                                            "14px"
                                    }
                                },
                                this.state.status
                            )

                            : null,


                        value.length

                            ? h(
                                "div",
                                {
                                    style: {
                                        marginTop:
                                            "16px"
                                    }
                                },

                                [

                                    h(
                                        "strong",
                                        {},
                                        `${value.length} image${value.length === 1 ? "" : "s"}`
                                    ),

                                    h(
                                        "div",
                                        {
                                            style: {
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "repeat(4, 1fr)",
                                                gap:
                                                    "10px",
                                                marginTop:
                                                    "10px"
                                            }
                                        },

                                        value.map(
                                            (path, index) =>

                                                h(
                                                    "div",
                                                    {
                                                        key:
                                                            `${path}-${index}`,
                                                        style: {
                                                            position:
                                                                "relative",
                                                            background:
                                                                "#eee",
                                                            borderRadius:
                                                                "6px",
                                                            overflow:
                                                                "hidden"
                                                        }
                                                    },

                                                    [

                                                        h(
                                                            "img",
                                                            {
                                                                src:
                                                                    path,
                                                                style: {
                                                                    width:
                                                                        "100%",
                                                                    height:
                                                                        "90px",
                                                                    objectFit:
                                                                        "cover",
                                                                    display:
                                                                        "block"
                                                                }
                                                            }
                                                        ),

                                                        h(
                                                            "button",
                                                            {
                                                                type:
                                                                    "button",

                                                                onClick:
                                                                    () =>
                                                                        this.removeImage(
                                                                            index
                                                                        ),

                                                                style: {
                                                                    position:
                                                                        "absolute",
                                                                    top:
                                                                        "4px",
                                                                    right:
                                                                        "4px",
                                                                    border:
                                                                        "0",
                                                                    borderRadius:
                                                                        "50%",
                                                                    width:
                                                                        "24px",
                                                                    height:
                                                                        "24px",
                                                                    cursor:
                                                                        "pointer",
                                                                    background:
                                                                        "#fff"
                                                                }
                                                            },

                                                            "×"
                                                        )

                                                    ]

                                                )

                                        )

                                    )

                                ]

                            )

                            : null

                    ]

                );

            }

        });


    /* =========================
       REGISTER WIDGET
    ========================= */

    CMS.registerWidget(
        "bulk-gallery",
        BulkGalleryControl
    );

})();