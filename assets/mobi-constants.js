window.MOBIKASA = window.MOBIKASA || {};
window.MOBIKASA.constants = {
  defaultSchema: {
    moduleAttribute: 'data-module',
    elAttribute: 'data-el',
  },
  drawers: {
    matches : {
      trigger: '[data-module-drawers-trigger]',
      close: '[data-module-drawers-close]',
      backdrop: '.js-Drawers_Backdrop',
    },
    els : {
      body: document.body || document.documentElement,
      backdrop: getElement('.js-Drawers_Backdrop'),
      drawers: getElement('.drw-Drawers'),
    },
    classes : {
      activeClass: 'drw-Drawers-active',
      activeDrawerClass: 'drw-Drawer-active',
      siteOverflowed: 'util-SiteOverflowed',
      setHeight: 'util-SetHeight',
    }
  },
  drawer: {
    classes : {
      activeDrawerClass: 'drw-Drawer-active',
    }
  }
}