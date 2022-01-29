const config = {
    'pagesEndpoint': "https://api.cosmicjs.com/v2/buckets/feaecfa0-7f60-11ec-9e9d-91dbef328d60/objects?pretty=true&query=%7B%22type%22%3A%22paragraphs%22%7D&read_key=uWFD6YJcIEXAzvMNc0bDRLr0BoRI57JC1GNbJSLRsM1f41teCk&limit=20&props=slug,title,content",
    'imagesEndpoint': "https://api.cosmicjs.com/v2/buckets/feaecfa0-7f60-11ec-9e9d-91dbef328d60/media?pretty=true&read_key=uWFD6YJcIEXAzvMNc0bDRLr0BoRI57JC1GNbJSLRsM1f41teCk&limit=20&props=imgix_url,metadata,"
}
let dataHolder = {
    content: {}
}

// ready
$(function () {

    // get page content
    $.get(config.pagesEndpoint)
        .then(function (res) {
            if (res && res.objects && res.objects.length) {
                renderPagesContent(res.objects);
                dataHolder.content.pages = res.objects;
            } else {
                throw new Error('Failed to initialize pages');
            }
        })
        .catch(console.error);

    // get gallery image content
    $.get(config.imagesEndpoint)
        .then(function (res) {
            if (res && res.media && res.media.length) {
                dataHolder.content.media = res.media;
                createImageGallary(res.media);
            } else {
                throw new Error('Failed to initialize gallery');
            }
        })
        .catch(console.error);

    // ===
    // function definitions
    // ====

    // params 
    // pages - Array of objects
    function renderPagesContent(pagesArray) {
        if (pagesArray) {
            pagesArray.forEach(page => {
                const template = page && page.content;
                if (template && page.slug) {
                    renderStringBasedOnClass(template, page.slug);
                }
            });
        }
    }


    // params
    // templateString - String of HTML elements
    // htmlIdString - class to append to
    function renderStringBasedOnClass(templateString, htmlIdString, dontEmpty) {
        if (templateString && htmlIdString) {
            const template = $.parseHTML(templateString);
            const id = '#' + htmlIdString;
            if (!dontEmpty) {
                $(id).empty();
            }
            $(id).append(template);
        }
    }

    // params
    // sortingClass - string that sorts based on type
    // imageUrlString - img src string
    // h2 - string for h2 hover text
    // p - string for p hover sub text
    function createGalleryImageTemplateString(sortingClass, imageUrlString, h2, p, id) {
        return `
        <div class="tm-gallery-item ${sortingClass}">
            <figure class="effect-bubba">
                <img src="${imageUrlString}" alt="Gallery item" class="tm-img-responsive" />
                <figcaption>
                    ${h2 ? `<h2>${h2}</h2>` : ''}
                    ${p ? `<p>${p}</p>` : ''}
                    <a href="#${id}" rel="modal:open">Open Modal</a>
                </figcaption>
            </figure>
        </div>
        `
    }

    // params
    // sortingClass - string that sorts based on type
    function createGalleryListItemTemplateString(sortingClass) {
        return `. <li><a role="button" href="#" data-filter=".${sortingClass}">${sortingClass}</a></li>`;
    }

    // params
    // imagesArr - array of objects for images
    function createImageGallary(imagesArr) {
        if (imagesArr) {
            createListSorter(imagesArr);
            createGalleryTiles(dataHolder.arrayOfGallerySorters);
            createISOgallery();
            createModals(dataHolder.arrayOfGallerySorters);
        }
    }

    function createModals(params) {
        const templates = dataHolder.arrayOfGallerySorters.map(function (galleryObj) {
            return createModalTemplate(galleryObj.id, galleryObj.imgix_url);
        });
        templates.forEach(function (templateString) {
            renderStringBasedOnClass(templateString, 'body', true);
        });
    }

    function createModalTemplate(id, imageUrl) {
        return `
            <div id="${id}" class="modal">
                <img src="${imageUrl}" class="modal-image">
                <a href="#" rel="modal:close">Close</a>
            </div>
        `
    }

    function generateUniqueId() {
        return 'id' + parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(16).toString().replace(".", ""));
    }

    // params
    // imagesArr - array of objects for images
    function createGalleryTiles(imagesArr) {
        let templates = imagesArr.map(function (imageObj) {
            console.log(imageObj);
            imageObj.id = generateUniqueId();
            return createGalleryImageTemplateString(imageObj.metadata.sorter, imageObj.imgix_url, imageObj.metadata.h2, imageObj.metadata.p, imageObj.id);
        });
        // console.log(templates)
        templates.forEach(function (templateString) {
            renderStringBasedOnClass(templateString, 'tm-gallery', true);
        });
    }

    // params
    // imagesArr - array of objects for images
    function createListSorter(imagesArr) {
        const arrayOfGallerySorters = imagesArr.filter(image => image && image.metadata && image.metadata.sorter);
        const keys = arrayOfGallerySorters.map(image => image.metadata.sorter);
        let uniqueKeys = [];
        let templates = [];

        // store sorted gallery items
        dataHolder.arrayOfGallerySorters = arrayOfGallerySorters;

        // create unique strings
        uniqueKeys = keys.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });

        // create templates
        if (uniqueKeys.length) {
            templates = uniqueKeys.map(createGalleryListItemTemplateString);
        }

        // render html
        templates.forEach(function (templateString, i) {
            renderStringBasedOnClass(templateString, 'list-item-1', true);
        });
    }

    // params
    // str - string to capitalize
    function capitalizeFirstLetter(str) {
        if (!str) {
            str = '';
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function createISOgallery() {
        // code stolen from template

        /* Isotope Gallery */

        // init isotope
        var $gallery = $(".tm-gallery").isotope({
            itemSelector: ".tm-gallery-item",
            layoutMode: "fitRows"
        });
        // layout Isotope after each image loads
        $gallery.imagesLoaded().progress(function () {
            $gallery.isotope("layout");
        });

        $(".filters-button-group").on("click", "a", function () {
            var filterValue = $(this).attr("data-filter");
            $gallery.isotope({ filter: filterValue });
        });

        $(".tabgroup > div").hide();
        $(".tabgroup > div:first-of-type").show();
        $(".tabs a").click(function (e) {
            e.preventDefault();
            var $this = $(this),
                tabgroup = "#" + $this.parents(".tabs").data("tabgroup"),
                others = $this
                    .closest("li")
                    .siblings()
                    .children("a"),
                target = $this.attr("href");
            others.removeClass("active");
            $this.addClass("active");
        });
    }

});

