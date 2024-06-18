import {loginForTeacher} from '../../tools/login/login.js'
import { openAdventureView } from '../../tools/adventures/adventure.js';

const adventures = ["adventure1", "adventure3"];

adventures.forEach((adventure) => {
  it('Is able to preview adventures', () => {
    loginForTeacher();
    openAdventureView();
    cy.getDataCy(`preview_${adventure}`).click();
    // now it should be visible in code-page.
    cy.getDataCy(adventure)
      .should("be.visible")
      .should("contain.text", adventure)
    cy.getDataCy('adventures_tab').should("be.visible")
  })
})
