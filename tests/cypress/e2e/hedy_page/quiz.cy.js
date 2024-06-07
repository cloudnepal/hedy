import { createJSDocTypeExpression } from "typescript";
import { goToHedyPage } from "../tools/navigation/nav";

beforeEach(() => {
  goToHedyPage();
  cy.get('div[data-tab="quiz"]').click();
});

/**
 * This test is quite something. It randomly clicks through the quiz until it is
 * finished to make sure the quiz can be completed. This is complicated by the
 * fact that we can't know in advance whether we'll have click a correct or incorrect
 * answer, and so we won't know whether what page we need to expect next.
 *
 * Cypress isn't actually designed to support test cases like this.
 * Nevertheless, I don't want to hardcode questions and correct answers here, so
 * we do a bit of complex work.
 *
 * Each of the pages renders a specific element with a page counter index,
 * which advances by 1 every page. We can therefore wait for that element to
 * appear, and then we'll know the page has completed async rendering. After
 * we know the page has rendered, we can inspect what's visible to us, and
 * do an appropriate thing (declare victory, click the perfunctory "next" button,
 * or click a random answer).
 */
it('can complete the quiz by randomly clicking buttons', () => {
  cy.getDataCy('*start_quiz').click();

  randomlyClickThroughUntilFinished(0);

  // We must use a recursive function to loop, because of the async nature of cypress
  function randomlyClickThroughUntilFinished(expectedCounter) {
    // This will wait until the page with the counter value has loaded
    cy.getDataCy(`ctr:${expectedCounter}`);

    // Now that the page has loaded, it's safe to inspect it and do a conditional thing
    // depending on what it looks like.
    cy.get('*[data-tabtarget="quiz"]').then(($quizpane) => {
      if ($quizpane.find('*[data-cy="quiz_done"]').length) {
        // Yay, finished!
        return;
      }

      if ($quizpane.find('*[data-cy="advance_quiz"]').length) {
        // Click "next question" button"
        cy.getDataCy('*advance_quiz').click();
        randomlyClickThroughUntilFinished(expectedCounter + 1);
        return;
      }

      // Otherwise click a random answer
      cy.get('*[data-cy="quiz_choice"]:not(.incorrect-option)').then(($buttons) => {
        return Cypress._.sample($buttons.toArray());
      }).click();
      cy.get('button.pick-answer-button:visible').click();
      randomlyClickThroughUntilFinished(expectedCounter + 1);
    });
  }
});
