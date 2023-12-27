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
    window.MOBIKASA.drawers = this;
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
    const trigger = event.target.closest(selectors.trigger)
    if (!trigger) return

    this.getParentItem(trigger).setAttribute('aria-selected', 'true')

    if (this.getParentDrawer(trigger)) {
      this.getParentDrawer(trigger).setAttribute('aria-open', 'true')
    }
  }

  onBackClick (event) {
    const back = event.target.closest(selectors.back)
    if (!back) return

    const parentItem = this.getParentItem(back)
    parentItem.setAttribute('aria-selected', 'false')

    const parentDrawer = this.getParentDrawer(parentItem)

    if (parentDrawer) {
      parentDrawer.setAttribute('aria-open', 'false')
    }
  }

  getParentItem (el) {
    return el.closest(selectors.item)
  }

  getParentDrawer (el) {
    return el.closest(selectors.drawer)
  }
}
window.MOBIKASA.modules = {
  Application,
  Drawer,
  Drawers
};