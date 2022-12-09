import {goToRegisterStudent} from '../tools/navigation/nav.js'
import {login, loginForUser} from '../tools/login/login.js'

describe('Username field test', () => {
  it('passes', () => {

    goToRegisterStudent();

    // Tests username field interaction
       cy.get('#birth_year')
      .should('be.visible')
      .should('be.empty')
      .type('2000')
      .should('have.value', '2000');
  })
})
