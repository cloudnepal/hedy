import { goToProfilePage } from '../navigation/nav.js'

export function makeProfilePublic() {
    goToProfilePage();
    cy.get('#public_profile_button').click();
    cy.get('#personal_text').type('updating profile to be public');
    cy.get('#agree_terms').check();  // May start out checked, in which case 'click()' would undo the check!
    cy.get('#submit_public_profile').click();
}