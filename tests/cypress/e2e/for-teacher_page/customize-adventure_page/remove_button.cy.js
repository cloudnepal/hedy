import {loginForTeacher} from '../../tools/login/login.js'
import {goToEditAdventure} from '../../tools/navigation/nav.js'
import { createAdventure } from '../../tools/adventures/adventure.js'

describe('Preview button test', () => {
  it('passes', () => {
    loginForTeacher();
    goToEditAdventure();

    // Initially this should not be visible
    cy.getDataCy('modal_confirm')
      .should('not.be.visible');
    cy.get('#modal_no_button')
      .should('not.be.visible');
    cy.getDataCy('modal_yes_button')
      .should('not.be.visible');

    // Testing not removing adventure (clicking on remove and then on 'no')
    cy.get('#remove_adventure_button')
      .should('be.visible')
      .should('not.be.disabled')
      .should('have.attr', 'type', 'reset')
      .click();

    cy.getDataCy('modal_confirm')
      .should('be.visible');

    cy.get('#modal_no_button')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait(500);

    cy.getDataCy('modal_confirm')
      .should('not.be.visible');
    cy.get('#modal_no_button')
      .should('not.be.visible');

    // Creating a new adventure to remove
    createAdventure("test adv");

    // Testing removing adventure (clicking on remove and then on 'yes')
    cy.get('#remove_adventure_button')
      .click();

    cy.getDataCy('modal_yes_button')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    // back to for-teacher page
    cy.url()
      .should('eq', Cypress.config('baseUrl') + Cypress.env('teachers_page'));
  })
})
