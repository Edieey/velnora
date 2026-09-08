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