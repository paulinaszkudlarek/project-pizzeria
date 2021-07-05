import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor (id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;
    
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;
  
    thisProduct.dom = {};
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    console.log('thisProduct.dom.amountWidgetElem:', thisProduct.dom.amountWidgetElem);
  }

  initAccordion() {
    const thisProduct = this;
    
    /* find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log('clickableTrigger: ', clickableTrigger);
    
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      
      if(activeProduct && activeProduct != thisProduct.element) { 
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function(event) {
        thisProduct.processOrder();
        console.log('event: ', event);
      });
    }
    thisProduct.dom.cartButton.addEventListener('click', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });      
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    console.log('thisProduct.amountWidget w Product: ', thisProduct.amountWidget);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    let price = thisProduct.data.price;
    
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      for(let optionId in param.options) {
        const option = param.options[optionId];
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          if(!option.default) {
            price = price + option.price;
          } 
        } else {
          if(option.default) {
            price = price - option.price;
            console.log('option.price: ', option.price);
          }
        }
        
        const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        
        if(optionImage) {
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else { 
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          } 
        }           
      }
    }
    thisProduct.priceSingle = price;

    price *= thisProduct.amountWidget.value;
    thisProduct.dom.priceElem.innerHTML = price;
    console.log('thisProduct.dom.amountWidgetElem.input.innerHTML: ', thisProduct.dom.amountWidgetElem.innerHTML);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.amountWidget.value * thisProduct.priceSingle,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;      
  }

  addToCart() {
    const thisProduct = this; 
    
    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
    console.log('event:' , event);
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};

    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {},
      };
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId); 
        if(optionSelected) {
          params[paramId].options[optionId] = option.label;  
        }          
      }
    }
    return params;
  }
}

export default Product;