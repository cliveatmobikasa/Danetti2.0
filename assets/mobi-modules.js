class MediaBreakpoints {
  breakpoints = {
    xs: 450,
    sm: 768,
    md: 900,
    lg: 1200,
    xlg: 1440,
    xxlg: 1600,
  }

  get isXxs () {
    return window.innerWidth > this.breakpoints.xs
  }

  get isXs () {
    return window.innerWidth > this.breakpoints.xs
  }

  get isSm () {
    return window.innerWidth >= this.breakpoints.sm
  }

  get isMd () {
    return window.innerWidth > this.breakpoints.md
  }

  get isLg () {
    return window.innerWidth > this.breakpoints.lg
  }

  get isXlg () {
    return window.innerWidth > this.breakpoints.xlg
  }

  get isXxlg () {
    return window.innerWidth > this.breakpoints.xxlg
  }

  get isXxsViewport () {
    return window.innerWidth <= this.breakpoints.xs
  }

  get isXsViewport () {
    return window.innerWidth < this.breakpoints.sm
  }

  get isSmViewport () {
    return this.breakpoints.sm <= window.innerWidth && window.innerWidth <= this.breakpoints.md
  }

  get isMdViewport () {
    return this.breakpoints.md < window.innerWidth && window.innerWidth <= this.breakpoints.lg
  }

  get isLgViewport () {
    return this.breakpoints.lg < window.innerWidth && window.innerWidth <= this.breakpoints.xlg
  }
}
class Application {
  static start (element, schema) {
    const application = new Application(element, schema);
    application.start();
    return application;
  }
  constructor (element = document.documentElement, schema = window.MOBIKASA.constants.defaultSchema) {
    this.element = element;
    this.schema = schema;
  }
  async start() {
    await domReady();
    getElements(`[${this.schema.moduleAttribute}]`).forEach(el => {
      const name = el.getAttribute(this.schema.moduleAttribute);
      createObject(handlize(name), el, this);
    })
  }
  registerModule (el) {
    const name = el.getAttribute(this.schema.moduleAttribute);
    createObject(name, el)
  }
  reinitialiseModules (el) {
    getElements(`[${this.schema.moduleAttribute}]`, { context: el }).forEach(el => this.registerModule(el))
  }
}
class DataMap {
  constructor (context) {
    this.context = context
  }

  get element () {
    return this.context.element
  }

  get identifier () {
    return this.context.identifier
  }

  get state () {
    return this.context.state
  }

  get (key) {
    return this.element.getAttribute(this._getFormattedKey(key))
  }

  set (key, value) {
    this.element.setAttribute(this._getFormattedKey(key), value)
    if (!this.state.hasKey(key)) {
      this.state.addKey(key, value)
    }

    this.state[key] = value

    return this.get(key)
  }

  has (key) {
    return this.element.hasAttribute(this._getFormattedKey(key))
  }

  delete (key) {
    if (this.has(key)) {
      this.element.removeAttribute(this._getFormattedKey(key))

      return true
    }

    return false
  }

  _getFormattedKey (key) {
    return `data-${this.identifier}-${dasherize(key)}`
  }
}
class TargetSet {
  constructor (context) {
    this.context = context
  }

  get element () {
    return this.context.element
  }

  get identifier () {
    return this.context.identifier
  }

  get schema () {
    return this.context.schema
  }

  has (targetName) {
    return this.find(targetName) != null
  }

  find (...targetNames) {
    const selector = this._getSelectorForTargetNames(targetNames)

    return this.context.getElement(selector)
  }

  findAll (...targetNames) {
    const selector = this._getSelectorForTargetNames(targetNames)

    return this.context.getElements(selector)
  }

  _getSelectorForTargetNames (targetNames) {
    return targetNames.map(targetName => this._getSelectorForTargetName(targetName)).join(', ')
  }

  _getSelectorForTargetName (targetName) {
    const targetDescriptor = `${this.identifier}.${targetName}`

    return attributeValueContainsToken(this.schema.elAttribute, targetDescriptor)
  }
}
class Context {
  constructor (element, application) {
    this.element = element;
    this.application = application;

    this.state = {};
    this.targets = new TargetSet(this);
    this.data = new DataMap(this);
  }

  get identifier () {
    return this.element.getAttribute(this.schema.moduleAttribute)
  }

  get schema () {
    return this.application.schema
  }

  getElement (selector) {
    return getElement(selector, { context: this.element })
  }

  getElements (selector) {
    return getElements(selector, { context: this.element })
  }
}
class Module {
  static build(el, application) {
    const context = new Context(el, application);

    const module = new this(el, context);
    module.initialize(el, context);

    defineTargetEls(this, module);
    let identifier = module.identifier;
    window.MOBIKASA[identifier] = window.MOBIKASA[identifier] || [];
    window.MOBIKASA[identifier].push(module);
    module.setupListeners();
    return module
  }

  constructor () {
    this.listeners = [];
  }

  initialize (el, context) {
    this.el = el;
    this.context = context;
    if(Object.keys(window.MOBIKASA.constants).find(key => key == this.identifier)) {
      const key = uncapitalize(this.identifier);
      if(window.MOBIKASA.constants[key]) {
        for (const k in window.MOBIKASA.constants[key]) {
          this[k] = window.MOBIKASA.constants[key][k];
        }
      }
    }
  }

  setupListeners () {}
  
  addListeners (element, event, fn) {
    this.listeners.push({ element, event, fn });
    element.addEventListener(event, fn);
  }

  get element () {
    return this.context.element
  }

  get identifier () {
    return this.context.identifier
  }

  get className () {
    return this.context.className
  }

  get data () {
    return this.context.data
  }

  get state () {
    return this.context.state
  }

  get targets () {
    return this.context.targets
  }
}
class Header extends  Module {
  static methods = ['openHeader', 'requestTick', 'updateEl', 'checkPromoBar'];
  isTicking = false;
  lastKnownY = window.scrollY;
  offsetTrackedY = 0;
  scrollOffset = 100;
  safeZone = 200;
  scrollDirection = '';
  initialize (el, context) {
    super.initialize(el, context);
    this.updateEl();
    this.checkPromoBar();
  }
  setupListeners () {
    super.setupListeners();
    this.onScroll = this.onScroll.bind(this);
    this.addListeners(window, 'scroll', this.onScroll);
    this.addListeners(window, 'resize', this.checkPromoBar.bind(this));
  }
  onScroll () {
    const previouslyKnown = this.lastKnownY;
    const previousDirection = this.scrollDirection;
    this.lastKnownY = window.scrollY;
    this.scrollDirection = previouslyKnown < this.lastKnownY ? 'down' : 'up';
    if (previousDirection !== this.scrollDirection) {
      this.offsetTrackedY = this.lastKnownY;
    }
    this.requestTick();
  }
  requestTick () {
    if (!this.isTicking) requestAnimationFrame(this.updateEl.bind(this))
    this.isTicking = true;
  }
  updateEl () {
    this.isTicking = false;
    this.setSize();
    this.setVisibility();
  }
  setSize () {
    this.element.classList.toggle(this.data.get('sizeClass'), this.headerIsSmaller);
  }
  setVisibility () {
    this.element.classList.toggle(this.data.get('hiddenClass'), !this.shouldBeVisible);
    this.element.previousSibling.classList.toggle(this.data.get('hiddenClass'), !this.shouldBeVisible);
  }
  toggleSearch () {
    const mobileSearchPanel = getElement('[data-header-mobile-search]');
    mobileSearchPanel.setAttribute(
      'aria-expanded',
      mobileSearchPanel.getAttribute('aria-expanded') === 'false'
    )
  }
  openHeader () {
    this.element.classList.toggle(this.data.get('hiddenClass'), false);
  }
  checkPromoBar () {
    const topBar = getElement('.hd-TopBar');
    if (topBar) {
      const height = topBar.offsetHeight;
      getElement('body').style.setProperty('--PromoBarHeight', `${height}px`);
    }
  }
  get shouldBeVisible () {
    if (this.lastKnownY <= this.containerEl.offsetHeight + this.safeZone * 2) {
      return true
    }
    if (this.scrollDirection === 'down') {
      return !this.isOverOffset
    } else if (this.scrollDirection === 'up') {
      return this.isOverOffset
    }
  }
  get isOverOffset () {
    if (this.scrollDirection === 'down') {
      return this.lastKnownY >= this.offsetTrackedY + this.scrollOffset
    } else if (this.scrollDirection === 'up') {
      return this.lastKnownY <= this.offsetTrackedY - this.scrollOffset
    }
  }
  get headerIsSmaller () {
    return this.lastKnownY > this.safeZone
  }
  get containerEl () {
    return this.element.closest('[data-header-container-el]')
  }
}
class Drawer {
  constructor (key, drawers) {
    this.key = key;
    this.drawers = drawers;
    this.classes = window.MOBIKASA.constants.drawer.classes;
    this._isOpen = false;
    this.classes = {
      activeDrawerClass: 'drw-Drawer-active',
    };
    if (this.drawerShouldBeMoved) {
      window.setTimeout(() => {
        this.moveToElement.appendChild(this.els.drawer);
      }, parseInt(this.els.drawer.getAttribute('data-module-drawers-move-delay'), 10) || 0)
    }
  }
  get els () {
    return {
      trigger: getElement(`[data-module-drawers-trigger=${this.key}]`),
      drawer: getElement(`[data-module-drawers-drawer=${this.key}]`),
      close: getElement(`[data-module-drawers-close=${this.key}]`),
    }
  }
  get isOpen () {
    return this._isOpen
  }
  set isOpen (val) {
    this._isOpen = val;
    if (this.els.drawer) {
      this.els.drawer.classList.toggle(this.classes.activeDrawerClass, val);
    }
  }
  get isOverDrawer () {
    return this.els.drawer.closest(`[data-el="${this.drawers.overHeaderEl.dataset.el}"]`) != null
  }
  get isUnderDrawer () {
    return this.els.drawer.closest(`[data-el="${this.drawers.underHeaderEl.dataset.el}"]`) != null
  }
  get drawerShouldBeMoved () {
    return this.els.drawer.hasAttribute('data-module-drawers-move-me');
  }
  get moveToElement () {
    switch (this.els.drawer.getAttribute('data-module-drawers-move-me')) {
      case 'root':
        return this.drawers.element
      case 'over':
        return this.drawers.overHeaderEl
      case 'under':
        return this.drawers.underHeaderEl
      default:
        return getElement(this.els.drawer.getAttribute('data-module-drawers-move-me'))
    }
  }
}
class Drawers extends Module{
  static methods = ['handleClick']
  static targets = ['overHeader', 'underHeader'];
  constructor () {
    super();
  }
  initialize (el, context) {
    super.initialize(el, context);
    this.keys = getElements(`[data-module-drawers-trigger]`)
      .map(el => el.getAttribute('data-module-drawers-trigger'))
      .filter((value, index, self) => {
        return self.indexOf(value) === index
      });
    this.drawers = this.keys.map(key => this.createDrawer(key));
  }
  createDrawer (key) {
    return new Drawer(key, this);
  }
  handleClick (e) {
    const matches = this.matches;
    const eventType = getEventType();
    if (eventType === 'UNKNOWN') return
    e.preventDefault();

    if (eventType === 'TRIGGER') {
      const trigger = e.target.closest(matches.trigger);
      const key = trigger.getAttribute('data-module-drawers-trigger');

      if (this.keys.includes(key)) {
        if (window.MOBIKASA.mediaBreakpoints.isMd && key === 'filters') return
        this.activeDrawerKey = key === this.activeDrawerKey ? '' : key;
      } else {
        this.drawers.push(this.createDrawer(key));
        this.activeDrawerKey = key;
      }
    }

    if (eventType === 'CLOSE' || eventType === 'BACKDROP') {
      this.activeDrawerKey = ''
    }

    function getEventType () {
      if (e.target.closest(matches.trigger) !== null) {
        return 'TRIGGER'
      } else if (e.target.closest(matches.close) !== null) {
        return 'CLOSE'
      } else if (e.target.closest(matches.backdrop) !== null) {
        return 'BACKDROP'
      }
      return 'UNKNOWN'
    }
  }
  setupListeners () {
    this.addListeners(document.documentElement, 'click', this.handleClick.bind(this));
  }
  get activeDrawerKey () {
    return this.state.activeDrawerKey;
  }
  set activeDrawerKey (key) {
    this.els.body.classList.remove(`drw-Drawers-${this._activeDrawerKey}`)
    if (key !== '') {
      this.els.body.classList.add(`drw-Drawers-${key}`);
    }

    this.state.previousDrawerKey = this.state.activeDrawerKey;
    this.state.activeDrawerKey = key;

    this.drawers.forEach(drawer => (drawer.isOpen = drawer.key === key))

    const aDrawerIsOpen = this.drawers.some(drawer => drawer.isOpen);
    this.els.drawers.classList.toggle(this.classes.activeClass, aDrawerIsOpen);
    this.els.body.classList.toggle(this.classes.siteOverflowed, aDrawerIsOpen)
    const root = document.getElementsByTagName('html')[0]

    root.classList.toggle(this.classes.setHeight, aDrawerIsOpen)

    if (key !== '') {
      const drawer = this.drawers.find(drawer => drawer.key === key)
      this.overHeaderEl.classList.toggle('drw-Drawers_OverHeader-active', drawer.isOverDrawer)
      this.underHeaderEl.classList.toggle('drw-Drawers_UnderHeader-active', drawer.isUnderDrawer)
    } else {
      this.overHeaderEl.classList.remove('drw-Drawers_OverHeader-active')
      this.underHeaderEl.classList.remove('drw-Drawers_UnderHeader-active')
    }
  }
}
class MobileNav extends Module {
  constructor () {
    super();
  }
  initialize (el, context) {
    super.initialize(el, context);
  }

  setupListeners () {
    super.setupListeners();
    this.onTriggerClick = this.onTriggerClick.bind(this);
    this.onBackClick = this.onBackClick.bind(this);

    this.addListeners(this.element, 'click', this.onTriggerClick);
    this.addListeners(this.element, 'click', this.onBackClick);
  }

  onTriggerClick (event) {
    const trigger = event.target.closest(this.selectors.trigger)
    if (!trigger) return

    this.getParentItem(trigger).setAttribute('aria-selected', 'true')

    if (this.getParentDrawer(trigger)) {
      this.getParentDrawer(trigger).setAttribute('aria-open', 'true')
    }
  }

  onBackClick (event) {
    const back = event.target.closest(this.selectors.back)
    if (!back) return

    const parentItem = this.getParentItem(back)
    parentItem.setAttribute('aria-selected', 'false')

    const parentDrawer = this.getParentDrawer(parentItem)

    if (parentDrawer) {
      parentDrawer.setAttribute('aria-open', 'false')
    }
  }

  getParentItem (el) {
    return el.closest(this.selectors.item)
  }

  getParentDrawer (el) {
    return el.closest(this.selectors.drawer)
  }
}
class Instagram extends Module {
  static methods = ['bindFourSixty', 'onScroll'];

  initialize (el, context) {
    super.initialize(el, context);
  }

  setupListeners () {
    window.addEventListener('scroll', this.onScroll.bind(this))
  }

  onScroll () {
    const parentOffset = this.el.parentElement.getBoundingClientRect();
    const top = parentOffset.top - window.innerHeight;

    if (top < 0) {
      window.removeEventListener('scroll', this.onScroll);
      this.bindFourSixty();
    }
  }

  bindFourSixty () {
    this.el.src = this.el.dataset.src;
  }

}

class FooterAccordions extends Module {
  static targets = ['trigger', 'accordion']
  static methods = ['onTriggerClick']

  initialize (el, context) {
    super.initialize(el, context);
  }
  setupListeners () {
    super.setupListeners();
    
    this.triggerEls.forEach(trigger => {
      this.addListeners(trigger, 'click', this.onTriggerClick.bind(this));
    });
  }
  onTriggerClick (event) {
    const parentAccordion = this.getParentAccordion(event.target)
    parentAccordion.setAttribute(
      'aria-expanded',
      parentAccordion.getAttribute('aria-expanded') === 'true' ? 'false' : 'true',
    )
  }

  getParentAccordion (el) {
    return el.closest(this.selectors.accordion)
  }
}

class ProductCarousel extends Module {
  static targets = ['dot', 'slides', 'slide']

  initialize (el, context) {
    super.initialize(el, context);
  }
  
  setupListeners () {
    super.setupListeners();
    this.carousel = this.initialiseCarousel();
  }
  initialiseCarousel () {
    if (window.MOBIKASA.mediaBreakpoints.isSm && this.slideEls.length <= 3) return

    return new KeenSlider(this.slidesEl, {
      duration: 1000,
      loop: true,
      mode: 'snap',
      selector: '.car-Carousel_Slide',
      slides: {
        origin: 'center',
        perView: 1.4
      },
      breakpoints: {
        '(min-width: 768px)': {
          slides: {
            perView: 3,
            origin: 'auto'
          }
        },
      },
      created: instance => this.dotEls[0].setAttribute(
        'aria-current',
        parseInt(this.dotEls[0].dataset.slide) === instance.track.details.rel
      ),
      slideChanged: instance => {
        this.dotEls.forEach(dot => {
          dot.setAttribute(
            'aria-current',
            parseInt(dot.dataset.slide) === instance.track.details.rel
          )
        })
      },
    })
  }
}
class CtaCarousel extends Module {
  static targets = ['controlnext', 'controlprevious', 'image', 'slides', 'slide'];

  animationSettings = {
    characterOffset: 0.006,
    duration: 0.5,
    transformY: 30,
  }
  initialize (el, context) {
    super.initialize(el, context);
  }
  setupListeners () {
    super.setupListeners();
    this.carousel = this.initialiseCarousel();
    this.addListeners(this.controlpreviousEl, 'click', this.changeCarousel.bind(this));
    this.addListeners(this.controlnextEl, 'click', this.changeCarousel.bind(this));
  }
  initialiseCarousel () {
    return new KeenSlider(this.slidesEl, {
      duration: 2000,
      loop: true,
      mode: 'snap',
      selector: '.car-Carousel_Slide',
      slides: {
        origin: 'center',
        perView: 1.2,
        spacing: 15
      },
      breakpoints: {
        '(min-width: 768px)': {
          slides: {
            origin: 'center',
            perView: 1.9,
            spacing: 80
          }
        },
        '(min-width: 1200px)': {
          slides: {
            origin: 'center',
            perView: 2.1,
            spacing: 110
          }
        },
        '(min-width: 1600px)': {
          slides: {
            origin: 'center',
            perView: 2.4,
            spacing: 110
          }
        },
      },
      slideChanged: instance => {
        this.imageEls.forEach(image => {
          const imageSlideIndex = parseInt(image.dataset.slide);
          const actualImageWidth = Math.round(instance.size * 1.05);
          const widthDifference = actualImageWidth - instance.size;

          const transformAmount =
            widthDifference * instance.track.details.slides[imageSlideIndex].portion -
            widthDifference / 2;

          gsap.to(image, 0, {
            x: transformAmount,
          })
        })
      },
    })
  }

  changeCarousel (e) {
    if (e.currentTarget.dataset.direction === 'previous') {
      this.carousel.prev()
    } else {
      this.carousel.next()
    }
  }
}
class ArticleCarousel extends Module {
  static targets = ['controlnext', 'controlprevious', 'image', 'slides', 'slide']

  initialize (el, context) {
    super.initialize(el, context);
  }
  setupListeners () {
    super.setupListeners();
    this.changeCarousel = this.changeCarousel.bind(this);
    this.carousel = this.initialiseCarousel();
    this.addListeners(this.controlpreviousEl, 'click', this.changeCarousel);
    this.addListeners(this.controlnextEl, 'click', this.changeCarousel);
  }
  initialiseCarousel () {
    return new KeenSlider(this.slidesEl, {
      duration: 2000,
      loop: true,
      mode: 'snap',
      selector: '.car-Carousel_Slide',
      slides: {
        origin: 'center',
        perView: 1.2,
        spacing: 15
      },
      breakpoints: {
        '(min-width: 768px)': {
          slides: {
            origin: 'center',
            perView: 1.9,
            spacing: 80
          }
        },
        '(min-width: 1200px)': {
          slides: {
            origin: 'center',
            perView: 2.1,
            spacing: 110
          }
        },
        '(min-width: 1600px)': {
          slides: {
            origin: 'center',
            perView: 2.4,
            spacing: 110
          }
        },
      },
    })
  }

  changeCarousel (e) {
    if (e.currentTarget.dataset.direction === 'previous') {
      this.carousel.prev()
    } else {
      this.carousel.next()
    }
  }
}

class ScrollTo extends Module {
  static methods = ['smoothScroll'];
  static targets = ['trigger'];

  initialize (el, context) {
    super.initialize(el, context);
  }

  setupListeners () {
    super.setupListeners();
    this.triggerEls.forEach(trigger => {
      this.addListeners(trigger, 'click', () => {
        this.smoothScroll(trigger);
      })
    })
  }

  smoothScroll (el) {
    window.scrollTo({
      top: getOffsetTop(getElement(`[data-scroll-to-element="${el.dataset.scrollToTarget}"]`)),
      left: 0,
      behavior: 'smooth',
    })
  }
}

class UnTruncate extends Module {
  static targets = ['triggerOpen', 'triggerClose', 'fullContent', 'content'];
  static methods = ['unTruncate', 'truncate'];

  initialize (el, context) {
    super.initialize(el, context);
  }

  setupListeners () {
    this.addListeners(this.triggerOpenEl, 'click', this.unTruncate.bind(this));
    this.addListeners(this.triggerCloseEl, 'click', this.truncate.bind(this));
  }

  unTruncate (e) {
    this.fullContentEl.style.display = 'block'
    this.contentEl.style.display = 'none'
  }

  truncate (e) {
    this.fullContentEl.style.display = 'none'
    this.contentEl.style.display = 'block'
  }
}
class Collection extends Module {
  static methods = [
    'onScroll',
    'onHistoryChange',
    'onFacetRemovalClick',
    'onFacetSummaryClick',
    'onFacetBackClick',
    'onKeyUp',
    'onSubmit',
    'renderPage',
    'updateURLHash',
    'fromCache',
    'fromFetch',
    'render',
    'renderFilters',
    'renderActiveFacets',
    'renderAdditionalElements',
    'renderProductGridContainer',
    'setupObservers',
    'renderProductGridPagination',
    'renderProductCount',
    'renderSelectedFacetCount',
  ]

  static targets = [
    'form',
    'facets',
    'facet',
    'facetRemove',
    'facetsSelected',
    'facetSummary',
    'facetBack',
    'activeFacets',
    'productGrid',
    'productCount',
    'header',
    'sortBy',
  ]

  initialize (el, context) {
    super.initialize(el, context);
    this.sections = [
      {
        id: `shopify-section-${this.el.dataset.id}`,
        section: this.el.dataset.id,
        selector: '.shopify-section',
      },
    ]

    this.cssSelectors = {
      form: '[data-el="collection.form"]',
      facetsContainer: '[data-el="collection.facets"]',
      facet: '[data-el="collection.facet"]',
      facetRemove: '[data-el="collection.facetRemove"]',
      facetsSelected: '[data-el="collection.facetsSelected"]',
      facetSummary: '[data-el="collection.facetSummary"]',
      facetBack: '[data-el="collection.facetBack"]',
      activeFacetsContainer: '[data-el="collection.activeFacets"]',
      productCount: '[data-el="collection.productCount"]',
      productGrid: '[data-el="collection.productGrid"]',
      pagination: '[data-el="collection.pagination"]',
      header: '[data-el="collection.header"]',
    }

    this.filterData = []

    this.searchParams = {
      // eslint-disable-next-line compat/compat
      previous: new URLSearchParams(window.location.search),
      // eslint-disable-next-line compat/compat
      current: new URLSearchParams(window.location.search),
      // eslint-disable-next-line compat/compat
      initial: new URLSearchParams(window.location.search),
    }
  }

  setupListeners () {
    super.setupListeners();
    this.addListeners(this.el, 'click', this.onFacetRemovalClick.bind(this))
    this.addListeners(this.el, 'click', this.onFacetSummaryClick.bind(this))
    this.addListeners(this.el, 'click', this.onFacetBackClick.bind(this))

    this.formEls.forEach(form => {
      this.addListeners(form, 'input', this.onSubmit.bind(this))
      this.addListeners(form, 'submit', this.onSubmit.bind(this))
    })

    this.addListeners(window, 'popstate', this.onHistoryChange.bind(this))

    this.facetsEls.forEach(facetsContainer => {
      this.addListeners(facetsContainer, 'keyup', this.onKeyUp.bind(this))
    })

    this.addListeners(this.sortByEl, 'change', this.onSubmit.bind(this))

    this.addListeners(window, 'scroll', this.onScroll)

    this.addListeners(document, 'click', this.onPaginationClick.bind(this))
  }

  onScroll () {
    const filterHeader = getElement('.clc-Filters_Header')
    if (!filterHeader) {
      return
    }
    if (window.scrollY > filterHeader.offsetTop + filterHeader.offsetHeight) {
      filterHeader.classList.add('clc-Filters_Header-sticky')
    } else {
      filterHeader.classList.remove('clc-Filters_Header-sticky')
    }
  }

  onHistoryChange (e) {
    const searchParams = e.state ? e.state.searchParams : this.searchParams.initial
    if (searchParams.toString() === this.searchParams.previous.toString()) {
      return
    }

    this.renderPage({ searchParams, updateURLHash: false })
  }

  onFacetRemovalClick (e) {
    const facet = e.target.closest(this.cssSelectors.facetRemove)

    if (!facet) {
      return true
    }

    e.preventDefault()
    e.stopPropagation()

    const href = facet.querySelector('a').href

    const searchParams = href.includes('?') ? href.slice(href.indexOf('?') + 1) : ''

    this.renderPage({ searchParams })
  }

  onFacetSummaryClick (e) {
    const facetSummary = e.target.closest(this.cssSelectors.facetSummary)

    if (!facetSummary) {
      return true
    }

    const facet = e.target.closest(`${this.cssSelectors.facet}`)

    if (!facet) return

    const isOpen = facet.getAttribute('aria-expanded') === 'true'
    facet.setAttribute('aria-expanded', !isOpen)
    facetSummary.setAttribute('aria-expanded', !isOpen)
  }

  onFacetBackClick (e) {
    const back = e.target.closest(this.cssSelectors.facetBack)

    if (!back) {
      return true
    }

    e.preventDefault()

    const facet = e.target.closest(this.cssSelectors.facet)
    const facetSummary = facet.querySelector(`${this.cssSelectors.facetSummary}`)

    const isOpen = facet.getAttribute('aria-expanded') === 'true'
    facet.setAttribute('aria-expanded', !isOpen)
    facetSummary.setAttribute('aria-expanded', !isOpen)
  }

  onKeyUp (e) {
    if (e.code.toUpperCase() !== 'ESCAPE') return

    const openFacet = e.target.closest(`${this.cssSelectors.facet}[open]`)
    if (!openFacet) return

    const summary = getElement(`${this.cssSelectors.facetSummary}`, {
      context: openFacet,
    })
    openFacet.removeAttribute('open')
    summary.setAttribute('aria-expanded', 'false')
    summary.focus()
  }

  onPaginationClick (e) {
    if (!e.target.closest('.clc-Detail_Pagination')) return

    e.preventDefault()

    const anchor = e.target.closest('a')
    if (!anchor || anchor.getAttribute('href') === '' || anchor.disabled) return

    const href = anchor.getAttribute('href')
    // eslint-disable-next-line compat/compat
    const paginationSearchParams = new URLSearchParams(href.split('?')[1])
    const wantedPage = paginationSearchParams.get('page') ?? '1'
    // eslint-disable-next-line compat/compat
    const currentSearchParams = new URLSearchParams(this.searchParams.current.toString())
    currentSearchParams.set('page', wantedPage)

    const headerTop = getElement(`${this.cssSelectors.header}`).offsetTop - 150

    window.scrollTo({
      top: headerTop,
      behavior: 'smooth',
    })

    this.renderPage({ searchParams: currentSearchParams.toString() })
  }

  onSubmit (e) {
    e.preventDefault()

    if (e.target.className === 'prc-Range_Input') {
      return false
    }

    const formData = new FormData(e.target.closest('form'))
    // eslint-disable-next-line compat/compat
    const searchParams = new URLSearchParams(formData).toString()

    this.renderPage({ searchParams, e })
  }

  renderPage ({ searchParams, e, updateURLHash = true } = {}) {
    this.searchParams.previous = this.searchParams.current
    // eslint-disable-next-line compat/compat
    this.searchParams.current = new URLSearchParams(searchParams)

    this.loading = true

    this.sections.forEach(section => {
      const url = `${window.location.pathname}?section_id=${
        section.section
      }&${this.searchParams.current.toString()}`

      const filterDataUrl = element => element.url === url

      this.filterData.some(element => filterDataUrl(element))
        ? this.fromCache(filterDataUrl, e)
        : this.fromFetch(section.section, url, e)
    })

    if (updateURLHash) this.updateURLHash(this.searchParams.current)
  }

  updateURLHash (searchParams) {
    history.pushState(
      { searchParams: searchParams.toString() },
      '',
      `${window.location.pathname}${searchParams && '?'.concat(searchParams.toString())}`,
    )
  }

  get loading () {
    return this._loading
  }

  set loading (val) {
    this._loading = val

    getElement(this.cssSelectors.productGrid).setAttribute('aria-busy', val.toString())
  }

  fromCache (filterDataUrl, e) {
    const html = this.filterData.find(element => filterDataUrl(element)).html

    this.render(html, e)
  }

  async fromFetch (section, url, e) {
    const html = await SectionRenderer.fetchSingle(section, url)

    this.filterData.push({ html, url })

    this.render(html, e)
  }

  render (html, e) {
    this.renderFilters(html, e)
    this.renderProductGridContainer(html)
    this.renderProductGridPagination(html)
    this.renderProductCount(html)

    this.loading = false
  }

  renderFilters (html, e) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html')
    const facetDetailElements = getElements(this.cssSelectors.facet, {
      context: parsedHTML,
    })

    facetDetailElements.forEach(element => {
      const selector = this.cssSelectors.facet
        .split(',')
        .map(selector => `${selector}[data-index="${element.dataset.index}"]`)
        .join(',')

      const el = getElement(selector)

      el.innerHTML = element.innerHTML
    })

    this.renderActiveFacets(parsedHTML)
    this.renderAdditionalElements(parsedHTML)
  }

  /**
   * @param {Document} parsedHTML
   *
   * @returns {void}
   */
  renderActiveFacets (parsedHTML) {
    const activeFacetElements = getElements(this.cssSelectors.activeFacetsContainer, {
      context: parsedHTML,
    })
    if (!activeFacetElements || !activeFacetElements.length) return

    this.activeFacetsEls.forEach(
      (activeFacetsContainer, index) =>
        (activeFacetsContainer.innerHTML = activeFacetElements[index].innerHTML),
    )
  }

  /**
   * @param {Document} parsedHTML
   *
   * @returns {void}
   */
  renderAdditionalElements (parsedHTML) {}

  /**
   * @param {String} html
   *
   * @returns {void}
   */
  renderProductGridContainer (html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html')

    getElement(this.cssSelectors.productGrid).innerHTML = getElement(
      this.cssSelectors.productGrid,
      {
        context: parsedHTML,
      },
    ).innerHTML

    this.setupObservers()
  }

  setupObservers () {
    this.onTriggerEnter = this.onTriggerEnter.bind(this)

    const animationSections = getElements('[ data-animate-section]')

    const offsetAmount = window.MOBIKASA.mediaBreakpoints.isXsViewport ? 100 : 200

    this.observer = new IntersectionObserver(this.onTriggerEnter, {
      rootMargin: `-${offsetAmount}px`,
    })
    animationSections.forEach(animationSection => {
      this.observer.observe(animationSection)
    })
  }

  onTriggerEnter (entries) {
    const sectionsEntered = entries.filter(entry => entry.isIntersecting)

    sectionsEntered.forEach(entry => {
      const contentEls = getElements('[data-animate-el]', { context: entry.target })
      const imageEls = getElements('[data-animate-image]', { context: entry.target })

      this.observer.unobserve(entry.target)

      if (imageEls) {
        const imageTimeline = gsap.timeline({ delay: 0.2 })
        imageTimeline.to(imageEls, 1.5, {
          opacity: 1,
          ease: 'expo.out',
        })
      }

      if (contentEls) {
        const contentTimeline = gsap.timeline({ delay: 0.2 })
        contentTimeline.staggerTo(
          contentEls,
          1,
          {
            autoAlpha: 1,
            y: '0%',
            ease: 'expo.out',
          },
          0.2,
        )
      }
    })
  }

  /**
   * @param {String} html
   *
   * @returns {void}
   */
  renderProductGridPagination (html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html')

    const pagination = getElement(this.cssSelectors.pagination)
    const newPagination = getElement(this.cssSelectors.pagination, {
      context: parsedHTML,
    })

    if (pagination && !newPagination) {
      pagination.remove()
      return
    }

    if (pagination) {
      pagination.innerHTML = newPagination.innerHTML
    } else if (newPagination) {
      this.productGridEl.parentNode.insertBefore(newPagination, this.productGridEl.nextSibling)
    }

    const loadMore = getElement('.clc-List', {
      context: parsedHTML,
    })

    Object.keys(loadMore.dataset).forEach(key => {
      getElement('.clc-List').dataset[key] = loadMore.dataset[key]
    })

    window.MOBIKASA.application.reinitialiseModules(this.el)
  }

  /**
   * @param {String} html
   *
   * @returns {void}
   */
  renderProductCount (html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html')
    const count = getElement(this.cssSelectors.productCount, {
      context: parsedHTML,
    })

    if (!count) return

    this.countElements.forEach(element => (element.innerHTML = count.innerHTML))
  }

  /**
   * @param {HTMLElement} source
   * @param {HTMLElement} target
   *
   * @returns {void}
   */
  renderSelectedFacetCount (source, target) {
    const sourceElement = getElement(this.cssSelectors.facetsSelected, {
      context: source,
    })
    const targetElement = getElement(this.cssSelectors.facetsSelected, {
      context: target,
    })

    if (sourceElement && targetElement) {
      targetElement.outerHTML = sourceElement.outerHTML
    }
  }

  /**
   * @returns {Element[]}
   */
  get countElements () {
    return getElements('[data-product-grid-count]')
  }
}

class CollectionListWithPromotions extends Module {
  static methods = ['onWindowResize']
  static targets = ['item', 'promotion', 'promotionImage']

  initialize (el, context) {
    super.initialize(el, context);
  }

  setupListeners () {
    super.setupListeners();
    this.promotionEls.forEach(el => this.sizePromotion(el));
    const throttled = debounce(this.onWindowResize.bind(this), 250);
    this.addListeners(window, 'resize', throttled);
  }
  onWindowResize () {
    this.promotionEls.forEach(promotion => {
      const promotionImage = getElement(this.selectors.promotionImage, { context: promotion })
      promotionImage.style.height = ''

      this.sizePromotion(promotion)
    })
  }

  sizePromotion (promotion) {
    if (window.MOBIKASA.mediaBreakpoints.isXsViewport && promotion.dataset['promotionWidth'] != 1) return

    const relevantItems = this.getLargestItemsOnEachRow(this.getRelevantItems(promotion));
    const firstOffsetTop = relevantItems[0].offsetTop;
    const lastItem = relevantItems.pop();
    const toTopOfSecondRow = lastItem.offsetTop - firstOffsetTop
    const heightOfImage = getElement('.prd-Card_ImageContainer', {
      context: lastItem.item,
    }).offsetHeight
    const promotionImage = getElement(this.selectors.promotionImage, { context: promotion })

    promotionImage.style.height = `${toTopOfSecondRow + heightOfImage}px`
  }

  getRelevantItems (promotion) {
    const promotionOffsetTop = getOffsetTop(promotion)
    const promotionImageContainer = getElement(this.selectors.promotionImage, {
      context: promotion,
    })
    const endOfImage = promotionOffsetTop + promotionImageContainer.offsetHeight

    return this.itemEls.filter(item => {
      const itemOffsetTop = getOffsetTop(item)

      return promotionOffsetTop <= itemOffsetTop && itemOffsetTop <= endOfImage
    })
  }

  getLargestItemsOnEachRow (items) {
    return items
      .map(item => ({ offsetTop: getOffsetTop(item), height: item.offsetHeight, item }))
      .reduce((acc, item) => {
        const currentlyHasThisOffset = acc.some(i => i.offsetTop === item.offsetTop)
        if (currentlyHasThisOffset) {
          const currentIndex = acc.findIndex(i => i.offsetTop === item.offsetTop);

          if (item.height > acc[currentIndex]) {
            acc[currentIndex] = item;
          }
        } else {
          acc.push(item);
        }

        return acc
      }, [])
  }
}


class PriceRange extends HTMLElement {
  static get requiredElements () {
    return ['min', 'max']
  }

  constructor () {
    super()

    this.setupListeners()
    this.setMinAndMaxValues()
    this.timeout = null
  }

  setupListeners () {
    this.onRangeChange = this.onRangeChange.bind(this)

    getElements('input', { context: this }).forEach(el =>
      el.addEventListener('change', this.onRangeChange),
    )
  }

  /**
   * @param {InputEvent} e
   *
   * @returns {void}
   */
  onRangeChange (e) {
    this.adjustToValidValues(e.currentTarget)
    this.setMinAndMaxValues()

    clearTimeout(this.timeout)

    this.timeout = setTimeout(() => {
      this.closest('form').dispatchEvent(new Event('submit'))
    }, 500)
  }

  setMinAndMaxValues () {
    if (this.maxInput.value) {
      this.minInput.setAttribute('max', this.maxInput.value)
    }
    if (this.minInput.value) {
      this.maxInput.setAttribute('min', this.minInput.value)
    }
    if (this.minInput.value === '') this.maxInput.setAttribute('min', '0')
    if (this.maxInput.value === '') {
      this.minInput.setAttribute('max', this.maxInput.getAttribute('max'))
    }
  }

  /**
   * @param {HTMLInputElement} input
   *
   * @returns {void}
   */
  adjustToValidValues (input) {
    const value = Number(input.value)
    const min = Number(input.getAttribute('min'))
    const max = Number(input.getAttribute('max'))

    if (value < min) input.value = min.toString()
    if (value > max) input.value = max.toString()
  }

  /**
   * @returns {HTMLInputElement}
   */
  get maxInput () {
    return getElement('[data-price-range-el="max"]', { context: this })
  }

  /**
   * @returns {HTMLInputElement}
   */
  get minInput () {
    return getElement('[data-price-range-el="min"]', { context: this })
  }
}

if (!customElements.get('price-range')) {
  customElements.define('price-range', PriceRange)
}
window.MOBIKASA.modules = {
  Application,
  Header,
  Drawers,
  MobileNav,
  Instagram,
  FooterAccordions,
  ProductCarousel,
  CtaCarousel,
  ArticleCarousel,
  ScrollTo,
  UnTruncate,
  Collection,
  CollectionListWithPromotions
};