const config = {
    'pagesEndpoint': "https://api.cosmicjs.com/v2/buckets/feaecfa0-7f60-11ec-9e9d-91dbef328d60/objects?pretty=true&query=%7B%22type%22%3A%22paragraphs%22%7D&read_key=uWFD6YJcIEXAzvMNc0bDRLr0BoRI57JC1GNbJSLRsM1f41teCk&limit=20&props=slug,title,content"
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

});

// params 
// pages - Array of objects
function renderPagesContent(pagesArray) {
    if (pagesArray) {
        pagesArray.forEach(page => {
            const template = page && page.content;
            if (template && page.slug) {
                renderStringBasedOnClass(template, page.slug)
            }
        });
    }
}

// params
// templateString - String of HTML elements
// htmlIdString - class to append to
function renderStringBasedOnClass(templateString, htmlIdString) {
    if (templateString && htmlIdString) {
        const template = $.parseHTML(templateString);
        const id = '#' + htmlIdString;
        $(id).empty();
        $(id).append(template);
    }
}