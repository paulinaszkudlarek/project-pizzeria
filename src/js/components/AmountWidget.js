import {select, settings} from '../settings.js';


class AmountWidget {
  constructor(element) {
    const thisWidget = this;
  
    //console.log('AmountWidget: ', thisWidget);
    //console.log('construktor arguments: ', element);
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;
    
    thisWidget.element = element;
    thisWidget.input = element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);
    //console.log('isNaN(newValue): ', isNaN(newValue));

    if(thisWidget.value !== newValue 
      && !isNaN(newValue) 
      && newValue >= settings.amountWidget.defaultMin 
      && newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
    }

    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }

  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles:true
    });
    thisWidget.element.dispatchEvent(event);
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;