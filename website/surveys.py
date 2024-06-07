from flask import request
from .database import Database
from .website_module import WebsiteModule, route


class SurveysModule(WebsiteModule):
    def __init__(self, db: Database):
        super().__init__("surveys", __name__, url_prefix="/surveys")
        self.db = db

    @route("/submit-survey/<survey_id>", methods=['POST'])
    def submit_survey(self, survey_id):
        survey_done = True
        survey = self.db.get_survey(survey_id)
        db = survey.get('responses')
        new_db = {}
        responses = {}

        for i, (question, answer) in enumerate(request.form.items(), start=1):
            if not answer:
                survey_done = False
            new_db[str(i)] = {'answer': answer, 'question': question}
            responses[question] = answer
        if survey_done is True:
            self.db.add_skip_survey(survey_id)
        if db:
            for question, answer in responses.items():
                for key, value in db.items():
                    if value['question'] == question:
                        value['answer'] = answer
            self.db.add_survey_responses(survey_id, db)
        else:
            self.db.add_survey_responses(survey_id, new_db)

        return ''

    @route("/skip-survey/<survey_id>", methods=['POST'])
    def skip_survey(self, survey_id):
        survey = self.db.get_survey(survey_id)
        if survey:
            self.db.add_skip_survey(survey_id)
        return ''

    @route("/remind-later-survey/<survey_id>", methods=['POST'])
    def remind_later_survey(self, survey_id):
        survey = self.db.get_survey(survey_id)
        if survey:
            self.db.add_remind_later_survey(survey_id)
        return ''
