window.MOBIKASA = window.MOBIKASA || {};
window.MOBIKASA.constants = {
  defaultSchema: {
    moduleAttribute: 'data-module',
    elAttribute: 'data-el',
  },
  'drawers': {
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
  'drawer': {
    classes : {
      activeDrawerClass: 'drw-Drawer-active',
    }
  },
  'mobile-nav': {
    selectors : {
      back: '[data-el="mobile-nav.back"]',
      drawer: '[data-el="mobile-nav.drawer"]',
      item: '[data-el="mobile-nav.item"]',
      trigger: '[data-el="mobile-nav.trigger"]',
    }
  },
  'footer-accordion': {
    selectors : {
      accordion: '[data-el="footer-accordions.accordion"]',
    }
  }
}