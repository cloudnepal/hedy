import collections

from website.yaml_file import YamlFile
import glob
from os import path
from flask_helpers import render_template


class AchievementTranslations:
    def __init__(self):
        self.data = {}

        translations = glob.glob('content/achievements/*.yaml')
        for trans_file in translations:
            lang = path.splitext(path.basename(trans_file))[0]
            self.data[lang] = YamlFile.for_file(trans_file)

    def get_translations(self, language):
        d = collections.defaultdict(lambda: 'Unknown Exception')
        d.update(**self.data.get('en', {}))
        d.update(**self.data.get(language, {}))
        return d


class PageTranslations:
    def __init__(self, page):
        self.data = {}
        if page in ['start', 'join', 'learn-more', 'for-teachers']:
            translations = glob.glob('content/pages/*.yaml')
        else:
            translations = glob.glob('content/pages/' + page + '/*.yaml')
        for file in translations:
            lang = path.splitext(path.basename(file))[0]
            self.data[lang] = YamlFile.for_file(file)

    def exists(self):
        """Whether or not any content was found for this page."""
        return len(self.data) > 0

    def get_page_translations(self, language):
        d = collections.defaultdict(lambda: '')
        d.update(**self.data.get('en', {}))
        d.update(**self.data.get(language, {}))
        return d


def render_code_editor_with_tabs(
        cheatsheet,
        commands,
        max_level,
        level_number,
        version,
        quiz,
        quiz_questions,
        loaded_program,
        adventures,
        parsons,
        parsons_exercises,
        tutorial,
        customizations,
        hide_cheatsheet,
        enforce_developers_mode,
        teacher_adventures,
        adventure_name):
    arguments_dict = {}

    # Meta stuff
    arguments_dict['level_nr'] = str(level_number)
    arguments_dict['level'] = level_number
    arguments_dict['current_page'] = 'hedy'
    arguments_dict['prev_level'] = int(level_number) - 1 if int(level_number) > 1 else None
    arguments_dict['next_level'] = int(level_number) + 1 if int(level_number) < max_level else None
    arguments_dict['customizations'] = customizations
    arguments_dict['hide_cheatsheet'] = hide_cheatsheet
    arguments_dict['enforce_developers_mode'] = enforce_developers_mode
    arguments_dict['teacher_adventures'] = teacher_adventures
    arguments_dict['loaded_program'] = loaded_program
    arguments_dict['adventures'] = adventures
    arguments_dict['commands'] = commands
    arguments_dict['parsons'] = parsons
    arguments_dict['parsons_exercises'] = parsons_exercises
    arguments_dict['tutorial'] = tutorial
    arguments_dict['adventure_name'] = adventure_name
    arguments_dict['latest'] = version
    arguments_dict['quiz'] = quiz
    arguments_dict['quiz_questions'] = quiz_questions

    return render_template(
        "code-page.html",
        **arguments_dict,
        cheatsheet=cheatsheet,
        blur_button_available=False)


def render_tutorial_mode(level, cheatsheet, commands, adventures, parsons_exercises):
    arguments_dict = {}

    arguments_dict['intro_tutorial'] = True
    arguments_dict['next_level'] = 2
    arguments_dict['level_nr'] = str(level)
    arguments_dict['level'] = str(level)
    arguments_dict['adventures'] = adventures
    arguments_dict['commands'] = commands
    arguments_dict['quiz'] = True
    arguments_dict['parsons'] = True if parsons_exercises else False
    arguments_dict['parsons_exercises'] = parsons_exercises

    return render_template(
        "code-page.html",
        **arguments_dict,
        cheatsheet=cheatsheet,
        blur_button_available=False)


def render_specific_adventure(commands, level_number, adventure, version, prev_level, next_level):
    arguments_dict = {}

    # Meta stuff
    arguments_dict['specific_adventure'] = True
    arguments_dict['level_nr'] = str(level_number)
    arguments_dict['commands'] = commands
    arguments_dict['level'] = level_number
    arguments_dict['prev_level'] = prev_level
    arguments_dict['next_level'] = next_level
    arguments_dict['customizations'] = []
    arguments_dict['hide_cheatsheet'] = None
    arguments_dict['enforce_developers_mode'] = None
    arguments_dict['teacher_adventures'] = []
    arguments_dict['adventures'] = adventure
    arguments_dict['latest'] = version

    return render_template("code-page.html", **arguments_dict, blur_button_available=False)
