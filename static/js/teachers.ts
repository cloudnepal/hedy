import { modal } from './modal';
import { showAchievements, theKeywordLanguage } from "./app";
import { ClientMessages } from './client-messages';
import DOMPurify from 'dompurify'
import { startTeacherTutorial } from './tutorials/tutorial';
import { HedyCodeMirrorEditorCreator } from './cm-editor';
import { initializeTranslation } from './lezer-parsers/tokens';
import { CustomWindow } from './custom-window';
import { addCurlyBracesToCode, addCurlyBracesToKeyword } from './adventure';
import { autoSave } from './autosave';
import { Chart } from 'chart.js';

declare const htmx: typeof import('./htmx');
declare let window: CustomWindow;
const editorCreator = new HedyCodeMirrorEditorCreator();

export function create_class(class_name_prompt: string) {
  modal.prompt (class_name_prompt, '', function (class_name) {
    $.ajax({
      type: 'POST',
      url: '/class',
      data: JSON.stringify({
        name: class_name
      }),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(response) {
      if (response.achievement) {
        showAchievements(response.achievement, false, '/for-teachers/customize-class/' + response.id);
      } else {
        window.location.pathname = '/for-teachers/customize-class/' + response.id ;
      }
    }).fail(function(err) {
      return modal.notifyError(err.responseText);
    });
  });
}

export function rename_class(id: string, class_name_prompt: string) {
    modal.prompt (class_name_prompt, '', function (class_name) {
        $.ajax({
          type: 'PUT',
          url: '/class/' + id,
          data: JSON.stringify({
            name: class_name
          }),
          contentType: 'application/json',
          dataType: 'json'
        }).done(function(response) {
          if (response.achievement) {
            showAchievements(response.achievement, true, "");
          } else {
            location.reload();
          }
        }).fail(function(err) {
          return modal.notifyError(err.responseText);
        });
    });
}

export function duplicate_class(id: string, teacher_classes: string[], second_teacher_prompt: string, prompt: string, defaultValue: string = '') {
  if (teacher_classes && !defaultValue){
    modal.confirm(second_teacher_prompt, function () {
      apiDuplicateClass(id, prompt, true, defaultValue);
    }, function () {
      apiDuplicateClass(id, prompt, false, defaultValue);
    });
  } else {
    apiDuplicateClass(id, prompt, false, defaultValue);
  }
}

function apiDuplicateClass(id: string, prompt: string, second_teacher: boolean, defaultValue: string = '') {
    modal.prompt (prompt, defaultValue, function (class_name) {
    $.ajax({
      type: 'POST',
      url: '/duplicate_class',
      data: JSON.stringify({
        id: id,
        name: class_name,
        second_teacher: second_teacher,
      }),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(response) {
      if (response.second_teachers && second_teacher == true){
        for (const secondTeacher of response.second_teachers) {
          $.ajax({
            type: 'POST',
            url: '/invite-second-teacher',
            data: JSON.stringify({
              username: secondTeacher.username,
              class_id: response.id
            }),
            contentType: 'application/json',
            dataType: 'json'
            }).fail(function(err) {
                modal.notifyError(err.responseText);
            });
        }
      }
      if (response.achievement) {
            showAchievements(response.achievement, true, "");
          } else {
            location.reload();
          }
    }).fail(function(err) {
      return modal.notifyError(err.responseText);
    });
  });
}

export function delete_class(id: string, prompt: string) {
  modal.confirm(prompt, function () {
    $.ajax({
      type: 'DELETE',
      url: '/class/' + id,
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (response) {
      if (response.achievement) {
        showAchievements(response.achievement, true, '');
      } else {
        location.reload();
      }
    }).fail(function (err) {
      modal.notifyError(err.responseText);
    });
  });
}

export function join_class(id: string, name: string) {
  $.ajax({
      type: 'POST',
      url: '/class/join',
      contentType: 'application/json',
      data: JSON.stringify({
        id: id,
        name: name
      }),
      dataType: 'json'
    }).done(function(response) {
      if (response.achievement) {
          showAchievements(response.achievement, false, '/programs');
      } else {
          window.location.pathname = '/programs';
      }
    }).fail(function(err) {
      if (err.status == 403) { //The user is not logged in -> ask if they want to
         return modal.confirm (err.responseText, function () {
            localStorage.setItem ('hedy-join', JSON.stringify ({id: id, name: name}));
            window.location.pathname = '/login';
         });
      } else {
          modal.notifyError(err.responseText || ClientMessages['Connection_error']);
      }
    });
}

export function invite_student(class_id: string, prompt: string, url='/invite-student') {
    modal.prompt (prompt, '', function (username) {
      $.ajax({
          type: 'POST',
          url,
          data: JSON.stringify({
            username: username,
            class_id: class_id
          }),
          contentType: 'application/json',
          dataType: 'json'
      }).done(function() {
          location.reload();
      }).fail(function(err) {
          modal.notifyError(err.responseText);
      });
    });
}

export function remove_student_invite(username: string, class_id: string, prompt: string) {
  return modal.confirm (prompt, function () {
      $.ajax({
          type: 'POST',
          url: '/remove_student_invite',
          data: JSON.stringify({
              username: username,
              class_id: class_id
          }),
          contentType: 'application/json',
          dataType: 'json'
      }).done(function () {
          location.reload();
      }).fail(function (err) {
          return modal.notifyError(err.responseText);
      });
  });
}

export function remove_student(class_id: string, student_id: string, prompt: string) {
  modal.confirm (prompt, function () {
    $.ajax({
      type: 'DELETE',
      url: '/class/' + class_id + '/student/' + student_id,
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(response) {
      // the check for response is necessary because of make_response() but I'm not sure why
      if (response && response.achievement) {
          showAchievements(response.achievement, true, "");
      } else {
          location.reload();
      }
    }).fail(function(err) {
        modal.notifyError(err.responseText);
    });
  });
}

function update_db_adventure(adventure_id: string) {
  // Todo TB: It would be nice if we improve this with the formToJSON() function once #3077 is merged
  const adventure_name = $('#custom_adventure_name').val();
  let classes: string[] = [];
  let levels: string[] = []

  document.querySelectorAll('#levels_dropdown > .option.selected').forEach((el) => {
    levels.push(el.getAttribute("data-value") as string)
  })

  document.querySelectorAll('#classes_dropdown > .option.selected').forEach((el) => {
    classes.push(el.getAttribute("data-value") as string)
  })

  const language = document.querySelector('#languages_dropdown> .option.selected')!.getAttribute('data-value') as string

  const content = DOMPurify.sanitize(window.ckEditor.getData());
  
  const parser = new DOMParser();
  const html = parser.parseFromString(content, 'text/html');
  const minLevel = Math.min(...levels.map((el) => Number(el)));
  let snippets: string[] = [] ;
  let snippetsFormatted: string[] = [];
  let keywords: string[] = []
  let keywordsFormatted: string[] = []

  for (const tag of html.getElementsByTagName('code')) {
    if (tag.className === "language-python") {
      snippets.push(tag.innerText);
    } else {
      keywords.push(tag.innerText);
    }
  }

  for (const snippet of snippets) {
    snippetsFormatted.push(addCurlyBracesToCode(snippet, minLevel, language || 'en'));
  }

  for (const keyword of keywords) {
    keywordsFormatted.push(addCurlyBracesToKeyword(keyword))
  }

  let i = 0;
  let j = 0;
  for (const tag of html.getElementsByTagName('code')) {
    if (tag.className === "language-python") {
      tag.innerText = snippetsFormatted[i++]
    } else {
      tag.innerText = keywordsFormatted[j++]
    }
  }
  // We have to replace <br> for newlines, because the serializer swithces them around
  const formatted_content = html.getElementsByTagName('body')[0].outerHTML.replace(/<br>/g, '\n');
  const agree_public = $('#agree_public').prop('checked');

  $.ajax({
    type: 'POST',
    url: '/for-teachers/customize-adventure',
    data: JSON.stringify({
      id: adventure_id,
      name: adventure_name,
      content: content,
      formatted_content: formatted_content,
      public: agree_public,
      language,
      classes,
      levels,
    }),
    contentType: 'application/json',
    dataType: 'json'
  }).done(function (response) {
    modal.notifySuccess(response.success);
  }).fail(function (err) {
    modal.notifyError(err.responseText);
  });
}

export function update_adventure(adventure_id: string, first_edit: boolean, prompt: string) {  
  if (!first_edit) {
    modal.confirm (prompt, function () {
        update_db_adventure(adventure_id);
    });
   } else {
       update_db_adventure(adventure_id);
   }
}

function show_preview(content: string) {
    const name = $('#custom_adventure_name').val();
    if (typeof name !== 'string') { throw new Error(`Expected name to be string, got '${name}'`); }
    let levels: string[] = []
    document.querySelectorAll('#levels_dropdown > .option.selected').forEach((el) => {
      levels.push(el.getAttribute("data-value") as string)
    })
    if (typeof levels !== 'object') { throw new Error(`Expected level to be a list, got '${levels}'`); }

    let container = $('<div>');
    container.addClass('preview border border-black px-8 py-4 text-left rounded-lg bg-gray-200 text-black');
    container.css('white-space', 'pre-wrap');
    container.css('width', '40em');
    container.html(content);

    // We have to show the modal first before we can "find" the <pre> attributes and convert them to ace editors
    modal.preview(container, name);
    for (const preview of $('.preview pre').get()) {
        $(preview).addClass('text-lg rounded');
        const dir = $("body").attr("dir");
        const codeNode = preview.querySelector('code')
        let code: string;
        // In case it has a child <code> node
        if(codeNode) {
          codeNode.hidden = true
          code = codeNode.innerText          
        } else {
          code = preview.textContent || "";
          preview.textContent = "";
        }
        const exampleEditor = editorCreator.initializeReadOnlyEditor(preview, dir);
        exampleEditor.contents = code.trimEnd();        
        for (const level of levels) {
          initializeTranslation({
            keywordLanguage: theKeywordLanguage,
            level: parseInt(level, 10),
          })
          exampleEditor.setHighlighterForLevel(parseInt(level, 10));                
        }
    }
}

export function preview_adventure() {
    let content = DOMPurify.sanitize(<string>$('#custom_adventure_content').val());
    if (!content) {
      content = window.ckEditor.getData();
    }
    // We get the content, send it to the server to parse the keywords and then show dynamically
    $.ajax({
      type: 'POST',
      url: '/for-teachers/preview-adventure',
      data: JSON.stringify({
          code: content
      }),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (response) {
        show_preview(response.code);
    }).fail(function (err) {
      modal.notifyError(err.responseText);
    });
}

export function delete_adventure(adventure_id: string, prompt: string) {
  modal.confirm(prompt, function () {
    $.ajax({
      type: 'DELETE',
      url: '/for-teachers/customize-adventure/' + adventure_id,
      contentType: 'application/json',
      dataType: 'json'
    }).done(function () {
      window.location.href = '/for-teachers';
    }).fail(function (err) {
      modal.notifyError(err.responseText);
    });
  });
}

export function change_password_student(username: string, enter_password: string, password_prompt: string) {
    modal.prompt ( enter_password + " " + username + ":", '', function (password) {
        modal.confirm (password_prompt, function () {
            $.ajax({
              type: 'POST',
              url: '/auth/change_student_password',
              data: JSON.stringify({
                  username: username,
                  password: password
              }),
              contentType: 'application/json',
              dataType: 'json'
            }).done(function (response) {
              modal.notifySuccess(response.success);
            }).fail(function (err) {
              modal.notifyError(err.responseText);
            });
        });
    });
}

export function show_doc_section(section_key: string) {
  // Todo TB: We can improve this code as it is quite cumbersome (08-22)
  $(".section-button").each(function(){
       if ($(this).hasClass('blue-btn')) {
           $(this).removeClass("blue-btn");
           $(this).addClass("green-btn");
       }
   });
   if ($ ('#section-' + section_key).is (':visible')) {
       $("#button-" + section_key).removeClass("blue-btn");
       $("#button-" + section_key).addClass("green-btn");
       $ ('.section').hide ();
   } else {
     $("#button-" + section_key).removeClass("green-btn");
     $("#button-" + section_key).addClass("blue-btn");
     $('.section').hide();
     $ ('.common_mistakes_section').hide ();
     $('#section-' + section_key).toggle();
   }
}

//https://stackoverflow.com/questions/7196212/how-to-create-dictionary-and-add-key-value-pairs-dynamically?rq=1
export function save_customizations(class_id: string) {
    let levels: (string | undefined)[] = [];
    $('[id^=enable_level_]').each(function() {
        if ($(this).is(":checked")) {
            levels.push(<string>$(this).attr('level'));
        }
    });
    let other_settings: string[] = [];
    $('.other_settings_checkbox').each(function() {
        if ($(this).prop("checked")) {
            other_settings.push(<string>$(this).attr('id'));
        }
    });
    let level_thresholds: Record<string, string> = {};
    $('.threshold_settings_value').each(function() {
        if ($(this).val() != '') {
            level_thresholds[$(this).attr('id') as string] = $(this).val() as string;
        }
    });
    let opening_dates: Record<string, string> = {};
    $('[id^=opening_date_level_]').each(function() {
      opening_dates[$(this).attr('level') as string] = $(this).val() as string;
    });
    // Not sending the adventures because the adventures are automatically saved in the database
    $.ajax({
      type: 'POST',
      url: '/for-teachers/customize-class/' + class_id,
      data: JSON.stringify({
          levels: levels,
          opening_dates: opening_dates,
          other_settings: other_settings,
          level_thresholds: level_thresholds
      }),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (response) {
      if (response.achievement) {
          showAchievements(response.achievement, false, "");
      }
      modal.notifySuccess(response.success);
      $('#remove_customizations_button').removeClass('hidden');
    }).fail(function (err) {
      modal.notifyError(err.responseText);
    });
}

export function restore_customization_to_default(prompt: string) {
    modal.confirm (prompt, async function () {
      // We need to know the current level that is selected by the user
      // so we can know which level to draw in the template  
      let active_level_id : string = $('[id^=level_]')[0].id;
      let active_level = active_level_id.split('_')[1]
      try {
        await htmx.ajax(
          'POST',
          `/for-teachers/restore-customizations?level=${active_level}`,
          '#adventure_dragger'
        )
        $('.other_settings_checkbox').prop('checked', false);
        // Remove the value from all input fields -> reset to text to show placeholder
        $('.opening_date_input').prop("type", "text")
                                .blur()
                                .val('')
                                .prop('disabled', false)                                
                                .attr('placeholder', ClientMessages.directly_available)
                                .each(function() {         
                                      if($(this).hasClass('bg-green-300')) {
                                        $(this).removeClass('bg-green-300')
                                              .addClass('bg-gray-200')
                                      }
                                });

        $('[id^=enable_level_]').prop('checked', true);                
        setLevelStateIndicator(active_level);
        modal.notifySuccess(ClientMessages.customization_deleted);          
      } catch (error) {
        console.error(error);
      }
    });
}

export function enable_level(level: string) {
    if ($('#enable_level_' + level).is(':checked')) {
      $('#opening_date_level_' + level).prop('disabled', false)
                                      .attr('type', 'text')
                                      .attr("placeholder", ClientMessages.directly_available)
                                      .removeClass('bg-green-300')
                                      .addClass('bg-gray-200')
    } else {
      $('#opening_date_level_' + level).prop('disabled', true)
                                       .attr('type', 'text')
                                       .attr("placeholder", ClientMessages.disabled)
                                       .val('');
    }

    if ($('#level_' + level).is(':visible')) {
      setLevelStateIndicator(level);
    }
}

export function setDateLevelInputColor(level: string) {
  var date_string : string = $('#opening_date_level_' + level).val() as string;
  var input_date = new Date(date_string);
  var today_date = new Date();
  if (input_date > today_date) {
    $('#opening_date_level_' + level).removeClass('bg-gray-200')
                                     .addClass('bg-green-300')

  } else {
    $('#opening_date_level_' + level).removeClass('bg-green-300')
                                     .addClass('bg-gray-200')
  }

  if ($('#level_' +  level).is(':visible')) {
    setLevelStateIndicator(level);
  }
}

export function add_account_placeholder() {
  // Get the hidden row template
  const rowTemplate = $('#account_row_unique').clone();
  rowTemplate.removeClass('hidden');
  rowTemplate.attr('id', "");

  // Function to update data-cy attributes
  function updateDataCyAttributes(row: JQuery<HTMLElement>, index: number) {
      row.find('[data-cy]').each(function() {
          const currentCy = $(this).attr('data-cy');
          if (currentCy) {
              const newCy = currentCy.replace(/_\d+$/, `_${index}`);
              $(this).attr('data-cy', newCy);
          }
      });
  }

  // Get the current number of rows
  const existingRowsCount = $('.account_row').length;

  // Append 5 rows at once
  for (let x = 0; x < 5; x++) {
      const newRow = rowTemplate.clone();
      updateDataCyAttributes(newRow, existingRowsCount + x + 1);
      newRow.appendTo("#account_rows_container");
  }
}

export function generate_passwords() {
    if (!$('#passwords_toggle').is(":checked")) {
        $('.passwords_input').val('');
        $('.passwords_input').prop('disabled', false);
        return;
    }
    $('.account_row').each(function () {
        if ($(this).is(':visible')) {
            $(this).find(':input').each(function () {
                if ($(this).attr('id') == "password") {
                    const random_password = generateRandomString(6);
                    $(this).val(random_password);
                }
            });
        }
    });
    $('.passwords_input').prop('disabled', true);
}

export function append_classname() {
    const classname = <string>$('#classes').val();
    $('.usernames_input').each(function () {
        $(this).val($(this).val() + "_" + classname);
    });
}

export function create_accounts(prompt: string) {
    modal.confirm (prompt, function () {
        $('#account_rows_container').find(':input').each(function () {
            $(this).removeClass('border-2 border-red-500');
            // Not really nice, but this removes the need for re-styling (a lot!)
            $(this).removeAttr('required');
        });
        let accounts: {}[] = [];
        $('.account_row').each(function () {
            if ($(this).is(':visible')) { //We want to skip the hidden first "copy" row
                let account: Record<string, string> = {};
                $(this).find(':input').each(function () {
                    account[$(this).attr("name") as string] = $(this).val() as string;
                });

                // Only push an account to the accounts object if it contains data
                if (account['password'].length !== 0 || account['username'].length !== 0) {
                    accounts.push(account);
                }
            }
        });
        $.ajax({
            type: 'POST',
            url: '/for-teachers/create-accounts',
            data: JSON.stringify({
                accounts: accounts
            }),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function (response) {
            if (response.error) {
                modal.notifyError(response.error);
                $('#account_rows_container').find(':input').each(function () {
                    if ($(this).val() == response.value) {
                        $(this).addClass('border-2 border-red-500');
                    }
                });
                return;
            } else {
                modal.notifySuccess(response.success);
                if ($("input[name='download_credentials_checkbox']:checked").val() == "yes") {
                    download_login_credentials(accounts);
                }
                $('#account_rows_container').find(':input').each(function () {
                   $(this).val("");
                });
            }
        }).fail(function (err) {
            modal.notifyError(err.responseText);
        });
    });
}

function download_login_credentials(accounts: any) {
    // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Username, Password" + "\r\n";

    accounts.forEach(function(account: any) {
        let row = account.username + "," + account.password;
        csvContent += row + "\r\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "accounts.csv");
    document.body.appendChild(link); // Required for Firefox

    link.click();
}

export function copy_join_link(link: string, success: string) {
    // https://qawithexperts.com/article/javascript/creating-copy-to-clipboard-using-javascript-or-jquery/364
    var sampleTextarea = document.createElement("textarea");
    document.body.appendChild(sampleTextarea);
    sampleTextarea.value = link;
    sampleTextarea.select();
    document.execCommand("copy");
    document.body.removeChild(sampleTextarea);
    modal.notifySuccess(success);
}

// https://onlinewebtutorblog.com/how-to-generate-random-string-in-jquery-javascript/
function generateRandomString(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export interface InitializeTeacherPageOptions {
  readonly page: 'for-teachers';

  /**
   * Whether to show the dialog box on page load
   */
  readonly welcome_teacher?: boolean;

  /**
   * Whether to show the tutorial on page load
   */
  readonly tutorial?: boolean;
}

export function initializeTeacherPage(options: InitializeTeacherPageOptions) {
  if (options.welcome_teacher) {
    modal.notifySuccess(ClientMessages.teacher_welcome, 30_000);
  }
  if (options.tutorial) {
    startTeacherTutorial();
  }
}

function setLevelStateIndicator(level: string) {
  $('[id^=state_]').addClass('hidden');

  if ($('#opening_date_level_' + level).is(':disabled')) {
    $('#state_disabled').removeClass('hidden');
  } else if($('#opening_date_level_' + level).val() === ''){
    $('#state_accessible').removeClass('hidden');
  } else {
    var date_string : string = $('#opening_date_level_' + level).val() as string;
    var input_date = new Date(date_string);
    var today_date = new Date();
    if (input_date > today_date) {
      $('#opening_date').text(date_string);
      $('#state_future').removeClass('hidden');
    } else {
      $('#state_accessible').removeClass('hidden');
    }
  }
}

export interface InitializeCustomizeClassPageOptions {
  readonly page: 'customize-class';
  readonly class_id: string;
}

export function initializeCustomizeClassPage(options: InitializeCustomizeClassPageOptions) {
  $(document).ready(function(){
      $('#back_to_class').on('click', () => {
        window.location.href = `/for-teachers/class/${options.class_id}`;
      });

      $('[id^=opening_date_level_]').each(function() {
        setDateLevelInputColor($(this).attr('level')!);
      })

      $('#levels_dropdown').on('change', function(){
          var level = $(this).val() as string;
          setLevelStateIndicator(level);
      });

      // Autosave customize class page
      // the third argument is used to trigger a GET request on the specified element
      // if the trigger (input in this case) is changed.
      autoSave("customize_class", null, {elementId: "levels_dropdown", trigger: "input"});

  });
}

/**
 * These will be copied into global variables, because that's how this file works...
 */
export interface InitializeClassOverviewPageOptions {
  readonly page: 'class-overview';
  readonly graph_students: student[];
  readonly level: number;
}

export function initializeClassOverviewPage(_options: InitializeClassOverviewPageOptions) {
  $('.attribute').change(function () {
    const attribute = $(this).attr('id');
    if (!(this as HTMLInputElement).checked) {
      $('#' + attribute + '_header').hide();
      $('.' + attribute + '_cell').hide();
    } else {
      $('#' + attribute + '_header').show();
      $('.' + attribute + '_cell').show();
    }
  });

  initializeGraph()
}

interface InitializeGraphOptions {
  readonly graph_students: student[];
  readonly level: number
}

interface student { 
  adventures_tried: number,
  number_of_errors: number,
  successful_runs: number,
  username: string,
}

interface dataPoint {
  x: number,
  y: number,
  r: number,
  successful_runs: number,
  name: string
}

export function initializeGraph() {
  const graphElement = document.getElementById('adventure_bubble') as HTMLCanvasElement
  if (graphElement === undefined || graphElement === null) return;
  const graphData: InitializeGraphOptions = JSON.parse(graphElement.dataset['graph'] || '') ;
  
  const students = graphData.graph_students
  let data: dataPoint[] = students.map((student: student) => {    
    let radius;
    
    if (student.successful_runs < 7)        radius = 7;
    else if (student.successful_runs > 300) radius = 300;
    else                                    radius = student.successful_runs;

    return {
      x: student.adventures_tried,
      y: student.number_of_errors,
      r: radius,
      successful_runs: student.successful_runs,
      name: student.username
    }
  });
  new Chart(
    graphElement,
    {
      type: 'bubble',
      data: {
        datasets: [
          {
            backgroundColor: '#c9dded',
            borderColor: '#35a4ff',
            data: data,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event, chartElement) => {
          //@ts-ignore
          event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default'
        },
        interaction: {
          mode: 'point'
        },
        onClick: (_e, activePoints, chart) => {
          if (activePoints.length === 0) return;
          const item: dataPoint = chart.data.datasets[0].data[activePoints[0].index] as dataPoint
          for(const point of activePoints) {
            console.log(chart.data.datasets[0].data[point.index])
          }
          document.getElementById('programs_container')?.classList.remove('hidden')
          htmx.ajax(
            'GET',
            `/for-teachers/get_student_programs/${item.name}`,
            '#programs_container'
          )
        },
        scales: {
          x: {
            title: {
              display: true,
              text: ClientMessages['adventures_tried'],
              font: {
                size: 15
              }
            }
          },
          y: {
            title: {
              display: true,
              text: ClientMessages['errors'],
              font: {
                size: 15
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: ClientMessages['graph_title'].replace('{level}', graphData.level.toString()),
            font: {
              size: 19
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                // A single point can have 2 data points associated.
                const names = tooltipItems.map((currentValue) => {
                  const item: dataPoint = currentValue.dataset.data[currentValue.dataIndex] as dataPoint
                  return item.name
                })
                return names.join(', ')
              },
              label: (tooltipItem) => {
                const item: dataPoint = tooltipItem.dataset.data[tooltipItem.dataIndex] as dataPoint
                return [
                  ClientMessages['adventures_completed'].replace('{number_of_adventures}', item.x.toString()),
                  ClientMessages['number_of_errors'].replace('{number_of_errors}', item.y.toString()),
                  ClientMessages['successful_runs'].replace('{successful_runs}', item.successful_runs.toString())
                ]
              }
            }
          }
        }
      },
    }
  );
}

export function invite_support_teacher(requester: string) {
  modal.prompt(`Invite a teacher to support ${requester}.`, '', function (username) {
    $.ajax({
        type: 'POST',
        url: "/super-teacher/invite-support",
        data: JSON.stringify({
          sourceUser: requester,
          targetUser: username,
        }),
        contentType: 'application/json',
        dataType: 'json'
    }).done(function() {
        location.reload();
    }).fail(function(err) {
        modal.notifyError(err.responseText);
    });
  });
}