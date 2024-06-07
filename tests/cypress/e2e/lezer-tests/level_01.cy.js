import { multiLevelTester, singleLevelTester } from "../tools/lezer/lezer_tester"

describe('Lezer parser tests for level 1', () => {
    describe('Successfull tests', () => {
        
        describe('Print tests', () => {
            const code = 'print hello world\nprint how are you'
            const expectedTree = 
                `Program(
                    Command(
                        Print(print,Text,Text)
                    ), 
                    Command(
                        Print(print,Text,Text,Text)
                    )
                )`
            
            multiLevelTester('Test print with text', code, expectedTree, 1, 3);
        });

        describe('Ask tests', () => {
            const code = 'ask what is your name';
            const expectedTree =
                `Program(
                Command(
                    Ask(ask,Text,Text,Text,Text)
                )
            )
            `
            singleLevelTester('Test ask', code, expectedTree, 1);
        })

        describe('Echo tests', () => {
            const code = 'echo hello';
            const expectedTree =
                `Program(
                Command(
                    Echo(echo, Text)
                )
            )
            `
            singleLevelTester('Test echo', code, expectedTree, 1);
        })

        describe('Turtle tests', () => {
            const code = `forward 20
            turn right
            color black`;

            const expectedTree =
                `Program(
                Command(
                    Turtle(Forward(forward,Text))
                ),
                Command(
                    Turtle(Turn(turn,Text))
                ),
                Command(
                    Turtle(Color(color,Text))
                )
            )`

            singleLevelTester('Test turtle commands: forward, turn, color', code, expectedTree, 1);
        });

        describe('Combined tests', () => {
            const code = `print Im Hedy the parrot
                ask whats your name?
                echo`
    
            const expectedTree =
                `Program(
                Command(
                    Print(print,Text,Text,Text,Text)
                ),
                Command(
                    Ask(ask,Text,Text,Text)
                ),
                Command(
                    Echo(echo)
                )
            )`
            singleLevelTester('Test print, ask, echo combined', code, expectedTree, 1);
        });
    });

    describe('Error tests', () => {
        describe('Misspelled command gives ErrorInvalid', () => {
            const code = 'hello world';
            const expectedTree = `Program(Command(ErrorInvalid(Text,Text)))`

            multiLevelTester('Test misspelled command', code, expectedTree, 1, 18);
        });

        describe('Correct command after error parses correctly', () => {
            const code = `prn hello world
            print pretty name
            `
            const expectedTree =
                `Program(
                Command(
                    ErrorInvalid(Text,Text,Text)
                ),
                Command(
                    Print(print,Text,Text)
                )
            )`

            multiLevelTester('Test command after error parses correctly', code, expectedTree, 1, 3);
        });
    })
});