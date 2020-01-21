'use strict';

// Получаем комбинации элементов
var formulas = window.formulas;

// Механизмы котла описывать здесь
let allElements = document.querySelector('.elements')
let elements = document.querySelectorAll('.elements > li');
let boiler = document.querySelector('.boiler');
let boilerIngridients = [];
let result = document.querySelector('.result');
let filter = document.querySelector('.filter');
let btnDelete = document.querySelector('.delete');

filter.addEventListener('input', findElement);
filter.addEventListener('blur', reset);
btnDelete.addEventListener('click', reset);

elements.forEach(element => element.addEventListener('mousedown', moveIngridient));

function findElement() {

    elements.forEach(element => {
        let currentPosition = element.innerText.indexOf(filter.value);

        if (currentPosition === -1) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            // Дополнительная функция чтобы уменьшить вложенность
            markElement(element, currentPosition);
        }

        if (filter.value === '') {
            elements.forEach(element => element.style.display = '');
        }
    });
}

// Дополнительная функция чтобы уменьшить вложенность

function markElement(element, currentPosition) {
    if (currentPosition === 0) {
        let b = element.innerText.slice(currentPosition + filter.value.length);
        element.innerHTML = `<mark>${filter.value}</mark>${b}`;
    } else {
        let a = element.innerText.slice(0, currentPosition);
        let b = element.innerText.slice(currentPosition + filter.value.length);
        element.innerHTML = `${a}<mark>${filter.value}</mark>${b}`;
    }
}

function reset() {
    filter.value = '';
    findElement();
}

function moveIngridient() {
    let current = this;
    let shiftX = event.clientX - current.getBoundingClientRect().left;
    let shiftY = event.clientY - current.getBoundingClientRect().top;
    let currentDroppable = null;
    let currentStartPlace = current.parentNode;
    let start = new Date();

    current.style.position = 'absolute';
    current.style.zIndex = 100;
    document.body.append(current);

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
        current.style.left = pageX - shiftX + 'px';
        current.style.top = pageY - shiftY + 'px';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(event) {


        moveAt(event.pageX, event.pageY);

        current.hidden = true;
        let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        current.hidden = false;

        if (!elemBelow) return;

        let droppableBelow = elemBelow.closest('.boiler');


        if (currentDroppable != droppableBelow) {

            if (currentDroppable) {
                leaveDroppable(currentDroppable);
            }
            currentDroppable = droppableBelow;
            if (currentDroppable) {
                enterDroppable(currentDroppable);
            }
        }
    }

    function enterDroppable(elem) {
        elem.style.background = 'rgb(183, 0, 255)';
    }

    function leaveDroppable(elem) {
        elem.style.background = '';
    }

    function onMouseUp(event) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Реализация клика

        let end = new Date();
        if ((end - start) < 350) {
            if (currentStartPlace.className === 'elements') {
                addIngridientsBoiler(current);
                return
            } else {
                removeBoilerIngridients(current);
                return
            }
        }

        current.hidden = true;
        let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        current.hidden = false;
        let droppableBelow

        if (!elemBelow) return;
        if (currentStartPlace.className === 'elements') {
            droppableBelow = elemBelow.closest('.boiler');
        } else {
            droppableBelow = elemBelow.closest('.elements');
        }

        if (droppableBelow === null) {
            current.style.position = '';
            current.style.zIndex = '';
            currentStartPlace.append(current);
            return;
        }

        if (currentStartPlace.className === 'elements' && droppableBelow.className === 'boiler') {

            addIngridientsBoiler(current);
        } else {

            removeBoilerIngridients(current)
        }

        findElement();
    }
}

function addIngridientsBoiler(current) {
    current.style.position = '';
    current.style.zIndex = '';
    current.remove();
    boiler.append(current);
    boilerIngridients.push(current.dataset.element);

    makeMagic();
}

function removeBoilerIngridients(current) {
    current.style.position = '';
    current.style.zIndex = '';
    current.remove();
    allElements.append(current);
    let removedIndex = boilerIngridients.indexOf(current.dataset.element);
    boilerIngridients.splice(removedIndex, 1);

    makeMagic();
}

function makeMagic() {

    if (boilerIngridients.length < 2) {
        result.innerHTML = '';
        return;
    }

    for (let formula of formulas) {


        for (let i = 0; i < boilerIngridients.length; i++) {
            if (!formula.elements.includes(boilerIngridients[i])) {
                break;
            }
            // Дополнительная функция чтобы уменьшить вложенность
            helpMakeMagic(formula, i);
        }
    }
}

// Дополнительная функция чтобы уменьшить вложенность

function helpMakeMagic(formula, i) {
    if (boilerIngridients.length === formula.elements.length) {
        if (i == (boilerIngridients.length - 1)) {
            result.innerHTML = formula.result;
            result.style.color = 'green';
            return;
        } else {
            result.innerHTML = formula.result;
            result.style.color = 'red';
        }
    } else if (boilerIngridients.length > formula.elements.length) {
        result.style.color = 'red';
    }
}
