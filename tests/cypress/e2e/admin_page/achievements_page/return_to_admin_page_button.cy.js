import { loginForAdmin } from '../../tools/login/login.js'
import { goToAdminAchievementsPage } from '../../tools/navigation/nav.js';

it('should return to admin page button', () => {
  loginForAdmin();
  goToAdminAchievementsPage();

  cy.getDataCy('return_to_admin_page_button')
    .should('be.visible')
    .should('be.not.disabled')
    .click();

  cy.url()
    .should('eq', Cypress.config('baseUrl') + Cypress.env('admin_page'));
})
