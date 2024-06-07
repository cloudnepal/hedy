import textwrap
import hedy_translation
from tests.Tester import HedyTester

# tests should be ordered as follows:
# * Translation from English to Dutch
# * Translation from Dutch to English
# * Translation to several languages
# * Error handling


class TestsTranslationLevel7(HedyTester):
    level = 7
    keywords_from = hedy_translation.keywords_to_dict('en')
    keywords_to = hedy_translation.keywords_to_dict('nl')

    def test_repeat_english_dutch(self):
        code = "repeat 3 times print 'Hedy is fun!'"

        result = hedy_translation.translate_keywords(code, from_lang="en", to_lang="nl", level=self.level)
        expected = "herhaal 3 keer print 'Hedy is fun!'"

        self.assertEqual(expected, result)

    def test_repeat2_english_dutch(self):
        code = "repeat 2 times print name"

        result = hedy_translation.translate_keywords(code, from_lang="en", to_lang="nl", level=self.level)
        expected = "herhaal 2 keer print name"

        self.assertEqual(expected, result)

    def test_repeat_dutch_english(self):
        code = "herhaal 3 keer print 'Hedy is fun!'"

        result = hedy_translation.translate_keywords(code, from_lang="nl", to_lang="en", level=self.level)
        expected = "repeat 3 times print 'Hedy is fun!'"

        self.assertEqual(expected, result)

    def test_repeat2_dutch_english(self):
        code = "herhaal 2 keer print ask"

        result = hedy_translation.translate_keywords(code, from_lang="nl", to_lang="en", level=self.level)
        expected = "repeat 2 times print ask"

        self.assertEqual(expected, result)

    def test_translate_back(self):
        code = "repeat 4 times print 'Welcome to Hedy'"

        result = hedy_translation.translate_keywords(code, from_lang="en", to_lang="nl", level=self.level)
        result = hedy_translation.translate_keywords(result, from_lang="nl", to_lang="en", level=self.level)

        self.assertEqual(code, result)

    def test_repeat_type_error_translates_command(self):
        code = textwrap.dedent(f"""\
            a is 1, 2, 3
            repeat a times print 'n'""")

        self.verify_translation(code, "en", self.level)
