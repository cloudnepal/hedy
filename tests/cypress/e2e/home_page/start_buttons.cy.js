import { loginForStudent, loginForTeacher, loginForUser } from "../tools/login/login";
import { navigateHomeButton } from "../tools/navigation/nav";

describe('Start buttons', () => {
  it('When not logged in: Should be able to click on start buttons', () => {
    navigateHomeButton('start_learning_button', Cypress.env('hedy_page'))
    // start_teaching button is tested in teacher_mode.cy.js
  })

  it('As a teacher: Should be able to click on start buttons', () => {
    loginForTeacher();
    navigateHomeButton('start_learning_button', Cypress.env('hedy_page'))
    navigateHomeButton('start_teaching_button', Cypress.env('teachers_page'))
    cy.getDataCy('teacher_mode_banner').should("not.exist");
  })

  it('As a student: Should be able to click on start buttons', () => {
    loginForStudent();
    navigateHomeButton('start_learning_button', Cypress.env('hedy_page'))
    navigateHomeButton('start_teaching_button', Cypress.env('teachers_page'))
    cy.getDataCy('teacher_mode_banner').should("be.visible");
  })

  it('As a user: Should be able to click on start buttons', () => {
    loginForUser();
    navigateHomeButton('start_learning_button', Cypress.env('hedy_page'))
    navigateHomeButton('start_teaching_button', Cypress.env('teachers_page'))
    cy.getDataCy('teacher_mode_banner').should("be.visible");
  })
})