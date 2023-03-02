import textwrap

from parameterized import parameterized

import hedy
from tests.Tester import HedyTester


class TestsLevel7(HedyTester):
    level = 7
    '''
    Tests should be ordered as follows:
     * commands in the order of hedy.py e.g. for level 1: ['print', 'ask', 'echo', 'turn', 'forward']
     * combined tests
     * markup tests
     * negative tests

    Naming conventions are like this:
     * single keyword positive tests are just keyword or keyword_special_case
     * multi keyword positive tests are keyword1_keywords_2
     * negative tests should be situation_gives_exception
    '''

    #
    # repeat tests
    #
    def test_repeat_turtle(self):
        code = "repeat 3 times forward 100"

        expected = HedyTester.dedent(
            "for __i__ in range(int('3')):",
            (HedyTester.forward_transpiled(100, self.level), '  '))

        self.single_level_tester(code=code, expected=expected, extra_check_function=self.is_turtle())

    def test_repeat_print(self):
        code = "repeat 5 times print 'me wants a cookie!'"

        expected = textwrap.dedent("""\
        for __i__ in range(int('5')):
          print(f'me wants a cookie!')
          time.sleep(0.1)""")

        output = textwrap.dedent("""\
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!""")

        self.single_level_tester(code=code, expected=expected, output=output)

    def test_repeat_print_variable(self):
        code = textwrap.dedent("""\
        n is 5
        repeat n times print 'me wants a cookie!'""")

        expected = textwrap.dedent("""\
        n = '5'
        for __i__ in range(int(n)):
          print(f'me wants a cookie!')
          time.sleep(0.1)""")

        output = textwrap.dedent("""\
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!""")

        self.single_level_tester(code=code, expected=expected, output=output)

    def test_repeat_print_undefined_variable_gives_error(self):
        code = "repeat n times print 'me wants a cookie!'"

        self.single_level_tester(code=code, exception=hedy.exceptions.UndefinedVarException)

    def test_repeat_with_string_variable_gives_type_error(self):
        code = textwrap.dedent("""\
        n is 'test'
        repeat n times print 'n'""")

        self.single_level_tester(code=code, exception=hedy.exceptions.InvalidArgumentTypeException)

    def test_repeat_with_list_variable_gives_type_error(self):
        code = textwrap.dedent("""\
        n is 1, 2, 3
        repeat n times print 'n'""")

        self.single_level_tester(code=code, exception=hedy.exceptions.InvalidArgumentTypeException)

    def test_repeat_with_missing_print_gives_error(self):
        code = textwrap.dedent("""\
        x is 3
        repeat 3 times x""")

        self.single_level_tester(code=code, exception=hedy.exceptions.IncompleteRepeatException)

    def test_repeat_with_missing_print_gives_lonely_text_exc(self):
        code = textwrap.dedent("""\
        repeat 3 times 'n'""")

        self.single_level_tester(code=code, exception=hedy.exceptions.LonelyTextException)

    def test_repeat_with_missing_times_gives_error(self):
        code = textwrap.dedent("""\
        repeat 3 print 'n'""")

        self.single_level_tester(code=code, exception=hedy.exceptions.IncompleteRepeatException)

    def test_repeat_ask(self):
        code = textwrap.dedent("""\
        n is ask 'How many times?'
        repeat n times print 'n'""")

        expected = textwrap.dedent("""\
        n = input(f'How many times?')
        for __i__ in range(int(n)):
          print(f'n')
          time.sleep(0.1)""")

        self.single_level_tester(code=code, expected=expected)

    @parameterized.expand(['5', '𑁫', '५', '૫', '੫', '৫', '೫', '୫', '൫', '௫',
                           '౫', '၅', '༥', '᠕', '៥', '๕', '໕', '꧕', '٥', '۵'])
    def test_repeat_with_all_numerals(self, number):
        code = textwrap.dedent(f"repeat {number} times print 'me wants a cookie!'")

        expected = textwrap.dedent(f"""\
        for __i__ in range(int('{int(number)}')):
          print(f'me wants a cookie!')
          time.sleep(0.1)""")

        output = textwrap.dedent("""\
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!""")

        self.single_level_tester(code=code, expected=expected, output=output)

    def test_repeat_over_9_times(self):
        code = textwrap.dedent("""\
        repeat 10 times print 'me wants a cookie!'""")

        expected = textwrap.dedent("""\
        for __i__ in range(int('10')):
          print(f'me wants a cookie!')
          time.sleep(0.1)""")

        output = textwrap.dedent("""\
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!""")

        self.single_level_tester(
            code=code,
            expected=expected,
            expected_commands=['repeat', 'print'],
            output=output)

    def test_repeat_with_variable_name_collision(self):
        code = textwrap.dedent("""\
        i is hallo!
        repeat 5 times print 'me wants a cookie!'
        print i""")

        expected = textwrap.dedent("""\
        i = 'hallo!'
        for __i__ in range(int('5')):
          print(f'me wants a cookie!')
          time.sleep(0.1)
        print(f'{i}')""")

        output = textwrap.dedent("""\
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        me wants a cookie!
        hallo!""")

        self.single_level_tester(
            code=code,
            expected=expected,
            expected_commands=['is', 'repeat', 'print', 'print'],
            output=output)

    def test_repeat_if(self):
        code = textwrap.dedent("""\
        naam is Hedy
        if naam is Hedy repeat 3 times print 'Hallo Hedy!'""")

        expected = textwrap.dedent("""\
        naam = 'Hedy'
        if convert_numerals('Latin', naam) == convert_numerals('Latin', 'Hedy'):
          for __i__ in range(int('3')):
            print(f'Hallo Hedy!')
            time.sleep(0.1)""")

        self.single_level_tester(
            code=code,
            expected=expected)

    def test_if_pressed_repeat(self):
        code = "if x is pressed repeat 5 times print 'doe het 5 keer!'"

        expected = HedyTester.dedent("""\
        pygame_end = False
        while not pygame_end:
          pygame.display.update()
          event = pygame.event.wait()
          if event.type == pygame.QUIT:
            pygame_end = True
            pygame.quit()
            break
          if event.type == pygame.KEYDOWN:
            if event.unicode != 'x':
                pygame_end = True
            if event.unicode == 'x':
              for __i__ in range(int('5')):
                print(f'doe het 5 keer!')
                time.sleep(0.1)
              break
            # End of PyGame Event Handler""")

        self.single_level_tester(
            code=code,
            expected=expected)

    def test_if_pressed_multiple(self):
        code = textwrap.dedent("""\
            if x is pressed print 'doe het 1 keer!'
            if y is pressed print 'doe het 1 keer!'
            if z is pressed print 'doe het 1 keer!'""")

        expected = HedyTester.dedent("""\
        pygame_end = False
        while not pygame_end:
          pygame.display.update()
          event = pygame.event.wait()
          if event.type == pygame.QUIT:
            pygame_end = True
            pygame.quit()
            break
          if event.type == pygame.KEYDOWN:
            if event.unicode == 'x':
              print(f'doe het 1 keer!')
              break
            else:
              _ = 'x'
          if event.type == pygame.KEYDOWN:
            if event.unicode == 'y':
              print(f'doe het 1 keer!')
              break
            else:
              _ = 'x'
          if event.type == pygame.KEYDOWN:
            if event.unicode != 'z':
                pygame_end = True
            if event.unicode == 'z':
              print(f'doe het 1 keer!')
              break
            # End of PyGame Event Handler""")

        self.single_level_tester(
            code=code,
            expected=expected,
            translate=False)

    def test_repeat_if_pressed_multiple(self):
        code = textwrap.dedent("""\
            repeat 3 times if x is pressed forward 15
            repeat 3 times if y is pressed forward 15
            repeat 3 times if z is pressed forward 15""")

        expected = HedyTester.dedent("""\
        for __i__ in range(int('3')):
          pygame_end = False
          while not pygame_end:
            pygame.display.update()
            event = pygame.event.wait()
            if event.type == pygame.QUIT:
              pygame_end = True
              pygame.quit()
              break
            if event.type == pygame.KEYDOWN:
              if event.unicode == 'x':
                __trtl = 15
                try:
                  __trtl = int(__trtl)
                except ValueError:
                  raise Exception(f'While running your program the command <span class="command-highlighted">forward</span> received the value <span class="command-highlighted">{__trtl}</span> which is not allowed. Try changing the value to a number.')
                t.forward(min(600, __trtl) if __trtl > 0 else max(-600, __trtl))
                time.sleep(0.1)
                break
              else:
                _ = 'x'
              # End of PyGame Event Handler
          time.sleep(0.1)
        for __i__ in range(int('3')):
          pygame_end = False
          while not pygame_end:
            pygame.display.update()
            event = pygame.event.wait()
            if event.type == pygame.QUIT:
              pygame_end = True
              pygame.quit()
              break
            if event.type == pygame.KEYDOWN:
              if event.unicode == 'y':
                __trtl = 15
                try:
                  __trtl = int(__trtl)
                except ValueError:
                  raise Exception(f'While running your program the command <span class="command-highlighted">forward</span> received the value <span class="command-highlighted">{__trtl}</span> which is not allowed. Try changing the value to a number.')
                t.forward(min(600, __trtl) if __trtl > 0 else max(-600, __trtl))
                time.sleep(0.1)
                break
              else:
                _ = 'x'
              # End of PyGame Event Handler
          time.sleep(0.1)
        for __i__ in range(int('3')):
          pygame_end = False
          while not pygame_end:
            pygame.display.update()
            event = pygame.event.wait()
            if event.type == pygame.QUIT:
              pygame_end = True
              pygame.quit()
              break
            if event.type == pygame.KEYDOWN:
              if event.unicode != 'z':
                  pygame_end = True
              if event.unicode == 'z':
                __trtl = 15
                try:
                  __trtl = int(__trtl)
                except ValueError:
                  raise Exception(f'While running your program the command <span class="command-highlighted">forward</span> received the value <span class="command-highlighted">{__trtl}</span> which is not allowed. Try changing the value to a number.')
                t.forward(min(600, __trtl) if __trtl > 0 else max(-600, __trtl))
                time.sleep(0.1)
                break
              # End of PyGame Event Handler
          time.sleep(0.1)""")

        self.single_level_tester(
            code=code,
            expected=expected,
            translate=False)

    def test_repeat_if_multiple(self):
        code = textwrap.dedent("""\
            aan is ja
            repeat 3 times if aan is ja print 'Hedy is leuk!'
            repeat 3 times if aan is ja print 'Hedy is leuk!'""")

        expected = HedyTester.dedent("""\
        aan = 'ja'
        for __i__ in range(int('3')):
          if convert_numerals('Latin', aan) == convert_numerals('Latin', 'ja'):
            print(f'Hedy is leuk!')
          else:
            _ = 'x'
          time.sleep(0.1)
        for __i__ in range(int('3')):
          if convert_numerals('Latin', aan) == convert_numerals('Latin', 'ja'):
            print(f'Hedy is leuk!')
          time.sleep(0.1)""")

        output = textwrap.dedent("""\
        Hedy is leuk!
        Hedy is leuk!
        Hedy is leuk!
        Hedy is leuk!
        Hedy is leuk!
        Hedy is leuk!""")

        self.single_level_tester(
            code=code,
            expected=expected,
            output=output,
            translate=False)
