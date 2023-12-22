/* eslint-disable */
function _typeof (e) {
  return (_typeof =
    typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
      ? function (e) {
          return typeof e
        }
      : function (e) {
          return e &&
            typeof Symbol === 'function' &&
            e.constructor === Symbol &&
            e !== Symbol.prototype
            ? 'symbol'
            : typeof e
        })(e)
}
const klevu_uc = {
  showLandingPageData (e) {
    let t
    let c = ''
    let a = ''
    const o = document.getElementById('searchedKeyword').value
    let n = ''
    let s = 0
    let i = 0
    let l = 0
    let u = 0
    let r = 0
    let d = 0
    let v = 0
    let m = 0
    let k = !1
    let p = ''
    let g = 5
    let h = !0
    let _ = ''
    let w = document.createElement('div')
    const f = document.createElement('div')
    const P = !!e.additionalDataToReturn && JSON.parse(e.additionalDataToReturn)
    ;((e = klevu_productCustomizations(e)).additionalFlags = P),
      e.productImage.trim().length === 0 && (e.productImage = klevu_userOptions.noImageUrl),
      (a = klevu_userOptions.openProductClicksInNewWindow
        ? ' target="_blank"'
        : ' onclick="klevu_analytics.stopClickDefault( event );" target="_self"'),
      (t = "{data: {code: '"
        .concat(escape(e.productCode), "',url: '")
        .concat(escape(e.productUrl), "',name: '")
        .concat(escape(e.productName), "',salePrice: '")
        .concat(escape(e.salePrice), "',rating: '")
        .concat(escape(e.rating), "',position: ")
        .concat(e.productPosition, ",category: '")
        .concat(escape(e.category), "',sku: '")
        .concat(escape(e.sku), "'},apiKey: null,keywordsLP: '")
        .concat(escape(o), "'}")),
      (n = klevu_commons.isMobileDevice()
        ? ' onclick="return klevu_analytics.trackClickedProduct(event, '.concat(
            t,
            ');" target="_self">'
          )
        : ' onmousedown="return klevu_analytics.trackClickedProduct(event, '
            .concat(t, ');" onkeydown="return klevu_eventHandler.handleElementKeydownEvent(event, ')
            .concat(t, ', klevu_analytics.trackClickedProduct);" ')
            .concat(a, '>'))
    try {
      ;(c += '<li>'),
        (c += '<div class="klevuImgWrap">'),
        (c += '<a  onfocus="klevu_eventHandler.handleProductFocusEvent(\'kuAddtocart-'
          .concat(escape(e.productCode), '\', event);"href="')
          .concat(e.productUrl.replace(/"/g, '%22'), '" ')),
        klevu_userOptions.showRolloverImage &&
          e.imageHover &&
          (c += ' onmouseleave = "klevu_commons.updateProductThumbnailImage(\''
            .concat(escape(e.productImage), "', 'klevuProductImage-")
            .concat(e.id, '\');"  onmouseenter = "klevu_commons.updateProductThumbnailImage(\'')
            .concat(escape(e.imageHover), "', 'klevuProductImage-")
            .concat(e.id, '\');" '))
      const b =
        e.productImage.indexOf('_medium.jpg') >= 0
          ? e.productImage.replace('_medium.jpg', '_560x.jpg')
          : e.productImage
      if (
        ((f.innerHTML = e.productName),
        (w = f.textContent || f.innerText || ''),
        (c += ' '
          .concat(n, '<img id= "klevuProductImage-')
          .concat(e.id, '" src="')
          .concat(b, '" onerror="this.onerror=null;this.src=\'')
          .concat(klevu_userOptions.noImageUrl, '\';" alt="')
          .concat(klevu_commons.escapeHtml(w), '"/>')),
        (c += '</a></div>'),
        klevu_userOptions.showProductSwatches &&
          e.swatches &&
          e.swatches.swatch &&
          e.swatches.swatch.length > 0)
      ) {
        for (g = e.swatches.swatch.length > g ? g : e.swatches.swatch.length, s = 0; s < g; s++)
          if ((l = e.swatches.swatch[s]).image) {
            if (
              ((k = !0),
              l.swatchImage && l.swatchImage.indexOf('#') === 0
                ? ((v = l.swatchImage.split(';')), (l.swatchImage = ''))
                : (v = l.color.replace(/ /g, '').replace(/-/g, '')),
              (h = !0),
              _typeof(v) === 'object')
            ) {
              for (i = 0; i < v.length; i++)
                if (v[i] && !klevu_commons.isValidCSSColor(v[i])) {
                  h = !1
                  break
                }
            } else
              l.swatchImage || klevu_commons.isValidCSSColor(v) || (h = !1),
                klevu_commons.isValidCSSColor(v) || (v = '')
            if (
              ((p += h
                ? '<div class="klevuSwatchItem">'
                : '<div class="klevuSwatchItem klevuDefaultSwatch">'),
              (r = "klevu_commons.updateProductThumbnailImage('"
                .concat(escape(l.image), "', 'klevuProductImage-")
                .concat(e.id, "');")),
              (d = "klevu_commons.updateProductThumbnailImage('"
                .concat(escape(e.productImage), "', 'klevuProductImage-")
                .concat(e.id, "');")),
              (u = klevu_commons.isMobileDevice()
                ? ' onclick = "'.concat(r, '" ')
                : ' onmouseleave = "'
                    .concat(d, '" onmouseenter = "')
                    .concat(r, '" onfocus = "')
                    .concat(r, '" onblur = "')
                    .concat(d, '" ')),
              (p += '<a href = "javascript:void(0);" class = "klevuSwatchLink" '.concat(u)),
              _typeof(v) === 'object')
            ) {
              const y = 100 / v.length
              for (_ = 'linear-gradient(-45deg,', i = 0; i < v.length; i++)
                (_ += i === 0 ? ' ' : ', '),
                  (_ += ''.concat(v[i], ' ').concat(y * i, '%')),
                  (_ += ', '.concat(v[i], ' ').concat(y * (i + 1), '%'))
              p += ' style = "background-image: '
                .concat((_ += ' );'), 'background-image: -webkit-')
                .concat(_, 'background-image: -moz-')
                .concat(_, 'background-image: -o-')
                .concat(_, 'background-image: -ms-')
                .concat(_, '" title="')
                .concat(l.color, '">')
            } else
              p += ' style = "background-color:'
                .concat(v, "; background-image:url('")
                .concat(l.swatchImage, '\');" title="')
                .concat(l.color, '" target="_self">')
            p += '</a></div>'
          } else m += 1
        e.swatches.swatch.length > g && (m += e.swatches.swatch.length - g),
          (p = k
            ? '<div class="klevuSwatches">'.concat(p)
            : '<div class="klevuSwatches" style="display:none;">'.concat(p)),
          (m += e.swatches.numberOfAdditionalVariants
            ? +e.swatches.numberOfAdditionalVariants
            : 0) > 0 &&
            k &&
            (p += '<div class = "klevuSwatchItem klevuSwatchMore"><a href = "'
              .concat(e.productUrl.replace(/"/g, '%22'), '" class = "klevuSwatchLink"')
              .concat(n, '<span class = "klevuSwatchMoreText">+')
              .concat(m, '</span></a></div>')),
          (c += p += '</div>')
      }
    } catch (e) {}
    return (
      typeof klevu_showDiscountBadge !== 'undefined' &&
        klevu_showDiscountBadge &&
        e.discount != '' &&
        e.discount != '0' &&
        e.discount != '0.0' &&
        (klevu_uiLabels.discountBadgeText.indexOf('#') === -1
          ? (c += '<div class="kuDiscountBadge">'
              .concat(klevu_uiLabels.discountBadgeText, ' ')
              .concat(Number(e.discount).toFixed(0), '%</div>'))
          : (c += '<div class="kuDiscountBadge">'.concat(
              klevu_uiLabels.discountBadgeText.replace(
                '#',
                ''.concat(Number(e.discount).toFixed(0), '%')
              ),
              '</div>'
            ))),
      (c += '<div class="kuNameDesc">'),
      (c += '<div class="kuName"><a tabindex="-1" href="'
        .concat(e.productUrl.replace(/"/g, '%22'), '" ')
        .concat(n)),
      (c += ''.concat(e.productName, '</a></div>')),
      (c += '<div class="kuDesc">'.concat(e.productDescription, '</div>')),
      (c += klevu_landingProductElements.showRating(e)),
      (c += '</div>'),
      (c += '<div class="kuPrice">'),
      klevu_showPrices && (c += klevu_landingProductElements.showPrices(e, 'kuSalePrice')),
      klevu_userOptions.vatCaption.trim().length > 0 &&
        (c += '<div class="klevu-vat-caption">('.concat(klevu_userOptions.vatCaption, ')</div>')),
      e.totalProductVariants &&
        e.totalProductVariants != '0' &&
        !k &&
        (klevu_uiLabels.variants.indexOf('#') === -1
          ? (c += '<div class="klevu-variants">+'
              .concat(e.totalProductVariants, ' ')
              .concat(klevu_uiLabels.variants, '</div>'))
          : (c += '<div class="klevu-variants">'.concat(
              klevu_uiLabels.variants.replace('#', e.totalProductVariants),
              '</div>'
            ))),
      klevu_userOptions.outOfStockCaption.trim().length > 0 &&
        e.inStock &&
        e.inStock === 'no' &&
        (c += '<div class="klevu-out-of-stock">'.concat(
          klevu_userOptions.outOfStockCaption,
          '</div>'
        )),
      (c += '</div>'),
      klevu_commons.showAddToCartButton(e.inStock, e.hideAddToCart) &&
        (c += klevu_landingProductElements.showAddtocart(e)),
      (c += '<div class="kuClearLeft"></div>'),
      (c += '</li>')
    )
  }
}
function klevu_uc_productCustomizations (e) {
  if (void 0 !== e.multiple_quantity && e.multiple_quantity !== '') {
    const t = Number(e.multiple_quantity)
    ;(e.startPrice = e.startPrice ? `${+e.startPrice * t}` : ''),
      (e.productPrice = e.productPrice ? `${+e.productPrice * t}` : ''),
      (e.price = e.price ? `${+e.price * t}` : ''),
      (e.oldPrice = e.oldPrice ? `${+e.oldPrice * t}` : ''),
      (e.salePrice = e.salePrice ? `${+e.salePrice * t}` : '')
  }
  return e
}
/* eslint-enable */
