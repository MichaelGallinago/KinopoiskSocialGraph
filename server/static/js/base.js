const obj = {}

function _createModal(options) {
    const modal = $(`<div class="${options.class}"></div>`)
    modal.html(options.content)
    $('body').append(modal)
    return modal
}

obj.modal = function (options) {
    const $modal = _createModal(options)
    let closing = false

    const modal = {
        open() {
            !closing && $modal.addClass('open')
        },
        close() {
            closing = true
            $modal.removeClass('open')
            closing = false
        }
    }

    const listener = event => {
        if (event.target.dataset.close) {
            modal.close()
        }
    }

    $modal.on('click', listener)

    return modal
}
