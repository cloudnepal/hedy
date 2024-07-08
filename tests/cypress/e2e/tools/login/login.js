import { goToHome, goToLogin } from "../navigation/nav";

export function loginForUser() {
    login("user1", "123456");
    cy.wait(500);
}

export function loginForTeacher(username="teacher1") {
    login(username, "123456");
    cy.wait(500);
}

export function loginForStudent(student="student1") {
    login(student, "123456");
    cy.wait(500);
}

export function loginForAdmin() {
    login("admin", "123456");
    cy.wait(500);
}

export function login(username, password) {
    cy.clearCookies();
    cy.clearAllLocalStorage()
    cy.clearAllSessionStorage();
    goToLogin();
    cy.getDataCy('username').type(username);
    cy.getDataCy('password').type(password);
    cy.getDataCy('login_button').click();
    cy.wait(500);
}

export function logout()
{
    goToHome();            
    cy.getDataCy('user_dropdown').click()
    cy.getDataCy('logout_button').click()
}

export default {loginForUser};
