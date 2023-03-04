import { modal } from './modal';
import { getHighlighter, showAchievements, turnIntoAceEditor } from "./app";
import { markUnsavedChanges, clearUnsavedChanges, hasUnsavedChanges } from './browser-helpers/unsaved-changes';
import { ClientMessages } from './client-messages';

import DOMPurify from 'dompurify'
import { AvailableAdventure, TeacherAdventure } from './types';
import { startTeacherTutorial } from './tutorials/tutorial';

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
      return modal.alert(err.responseText, 3000, true);
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
          return modal.alert(err.responseText, 3000, true);
        });
    });
}

export function duplicate_class(id: string, prompt: string) {
    modal.prompt (prompt, '', function (class_name) {
    $.ajax({
      type: 'POST',
      url: '/duplicate_class',
      data: JSON.stringify({
        id: id,
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
      return modal.alert(err.responseText, 3000, true);
    });
  });
}

export function delete_class(id: string, prompt: string) {
  modal.confirm (prompt, function () {
    $.ajax({
      type: 'DELETE',
      url: '/class/' + id,
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(response) {
      if (response.achievement) {
        showAchievements(response.achievement, true, '');
      } else {
        location.reload();
      }
    }).fail(function(err) {
      modal.alert(err.responseText, 3000, true);
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
          modal.alert(ClientMessages['Connection_error'], 3000, true);
      }
    });
}

export function invite_student(class_id: string, prompt: string) {
    modal.prompt (prompt, '', function (username) {
      $.ajax({
          type: 'POST',
          url: '/invite_student',
          data: JSON.stringify({
            username: username,
            class_id: class_id
          }),
          contentType: 'application/json',
          dataType: 'json'
      }).done(function() {
          location.reload();
      }).fail(function(err) {
          modal.alert(err.responseText, 3000, true);
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
          return modal.alert(err.responseText, 3000, true);
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
      if (response.achievement) {
          showAchievements(response.achievement, true, "");
      } else {
          location.reload();
      }
    }).fail(function(err) {
        modal.alert(err.responseText, 3000, true);
    });
  });
}

export function create_adventure(prompt: string) {
    modal.prompt (prompt, '', function (adventure_name) {
        $.ajax({
          type: 'POST',
          url: '/for-teachers/create_adventure',
          data: JSON.stringify({
            name: adventure_name
          }),
          contentType: 'application/json',
          dataType: 'json'
        }).done(function(response) {
          window.location.pathname = '/for-teachers/customize-adventure/' + response.id ;
        }).fail(function(err) {
          return modal.alert(err.responseText, 3000, true);
        });
    });
}

function update_db_adventure(adventure_id: string) {
   // Todo TB: It would be nice if we improve this with the formToJSON() function once #3077 is merged

   const adventure_name = $('#custom_adventure_name').val();
   const level = $('#custom_adventure_level').val();
   const content = DOMPurify.sanitize(<string>$('#custom_adventure_content').val());
   const agree_public = $('#agree_public').prop('checked');
   // Get all checked checkboxes of the class 'customize_adventure_class_checkbox' and map their values
   // The values in this case are the class id's for which we need to update the class customizations
   let classes = new Array();
   $(".customize_adventure_class_checkbox:checked").each(function () {
     classes.push($(this).val());
   });

    $.ajax({
      type: 'POST',
      url: '/for-teachers/customize-adventure',
      data: JSON.stringify({
        id: adventure_id,
        name: adventure_name,
        level: level,
        content: content,
        classes: classes,
        public: agree_public
      }),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(response) {
      modal.alert (response.success, 3000, false);
    }).fail(function(err) {
      modal.alert(err.responseText, 3000, true);
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
    const level = $('#custom_adventure_level').val();
    if (typeof level !== 'string') { throw new Error(`Expected level to be string, got '${name}'`); }

    let container = $('<div>');
    container.addClass('preview border border-black px-8 py-4 text-left rounded-lg bg-gray-200 text-black');
    container.css('white-space', 'pre-wrap');
    container.css('width', '40em');
    container.html(content);

    // We have to show the modal first before we can "find" the <pre> attributes and convert them to ace editors
    modal.preview(container, name);
    for (const preview of $('.preview pre').get()) {
        $(preview).addClass('text-lg rounded');
        const exampleEditor = turnIntoAceEditor(preview, true)
        exampleEditor.setOptions({ maxLines: Infinity });
        exampleEditor.setOptions({ minLines: 2 });
        exampleEditor.setValue(exampleEditor.getValue().replace(/\n+$/, ''), -1);
        const mode = getHighlighter(parseInt(level, 10));
        exampleEditor.session.setMode(mode);
    }
}

export function preview_adventure() {
    let content = DOMPurify.sanitize(<string>$('#custom_adventure_content').val());
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
      modal.alert(err.responseText, 3000, true);
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
            modal.alert(err.responseText, 3000, true);
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
              modal.alert(response.success, 3000, false);
            }).fail(function (err) {
              modal.alert(err.responseText, 3000, true);
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
     $ ('.common-mistakes-section').hide ();
     $('#section-' + section_key).toggle();
   }
}

//https://stackoverflow.com/questions/7196212/how-to-create-dictionary-and-add-key-value-pairs-dynamically?rq=1
export function save_customizations(class_id: string) {
    let levels: (string | undefined)[] = [];
    $('.level-select-button').each(function() {
        if ($(this).hasClass("green-btn")) {
            levels.push(<string>$(this).val());
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
    $('.opening_date_container').each(function() {
        if ($(this).is(":visible")) {
            $(this).find(':input').each(function () {
                opening_dates[$(this).attr('level') as string] = $(this).val() as string;
            });
        }
    });
    let sorted_adventures : Record<string, Record<string, string|boolean>[]> = {};
    $('#sortadventures').children().each(function() {
        const id = $(this).attr('id')!;
        const level = id.split('-')[1]!;
        sorted_adventures[level] = [];
        $('#'+id).children().each(function() {
            const level : string = $(this).attr('level')!;
            const adventure = $(this).attr('adventure')!;
            const from_teacher = $(this).attr('from-teacher') === "true"!;
            sorted_adventures[level].push({"name": adventure,"from_teacher": from_teacher});
        });
    });

    $.ajax({
      type: 'POST',
      url: '/for-teachers/customize-class/' + class_id,
      data: JSON.stringify({
          levels: levels,
          opening_dates: opening_dates,
          other_settings: other_settings,
          level_thresholds: level_thresholds,
          sorted_adventures: sorted_adventures
      }),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (response) {
      if (response.achievement) {
          showAchievements(response.achievement, false, "");
      }
      modal.alert(response.success, 3000, false);
      clearUnsavedChanges();
      $('#remove_customizations_button').removeClass('hidden');
    }).fail(function (err) {
      modal.alert(err.responseText, 3000, true);
    });
}

export function remove_customizations(class_id: string, prompt: string) {
    modal.confirm (prompt, function () {
        $.ajax({
            type: 'DELETE',
            url: '/for-teachers/customize-class/' + class_id,
            contentType: 'application/json',
            dataType: 'json'
        }).done(function (response) {
            $('#remove_customizations_button').addClass('hidden');
            $('.adventure_level_input').show();
            $('.adventure_level_input').prop('checked', true);
            $('.teacher_adventures_checkbox').prop('checked', false);
            $('.other_settings_checkbox').prop('checked', false);
            $('.level-select-button').removeClass('blue-btn');
            $('.level-select-button').addClass('green-btn');
            $('.opening_date_container').removeClass('hidden');

            // Remove the value from all input fields -> reset to text to show placeholder
            $('.opening_date_input').prop("type", "text");
            $('.opening_date_input').blur();
            $('.opening_date_input').val('');
            $('#sortadventures').children().each(
              function() {
                $(this).empty();
                const level = $(this).attr('id')!.split('-')[1];
                for (let i = 0; i < adventures_default_order[level].length; i++) {
                  // Note: this code is copy/pasted elsewhere in this file and also in customize-class.html. If you change it here, also change it there #}
                  const div =
                  `
                  <div draggable="true" class="tab z-10 whitespace-nowrap flex items-center justify-left relative" tabindex="0" adventure="${adventures_default_order[level][i]}" level="${level}" from-teacher="false">
                    <span class="absolute top-0.5 right-0.5 text-gray-600 hover:text-red-400 fa-regular fa-circle-xmark" data-cy="hide"></span>
                    ${adventure_names[adventures_default_order[level][i]]}
                  </div>
                  `
                  $(this).append(div);
                }
                drag_list(document.getElementById("level-"+level));
            });
            for (let i = 1; i <= 18; i++) {
              available_adventures[i] = [];
            }
            for (let i = 0; i < teacher_adventures.length; i++) {
              available_adventures[teacher_adventures![i]['level']].push({'name': teacher_adventures[i]['id'], 'from_teacher': true});
            }
            modal.alert(response.success, 3000, false);
        }).fail(function (err) {
            modal.alert(err.responseText, 3000, true);
        });
    });
}

export function select_all_levels_adventure(adventure_name: string) {
    markUnsavedChanges();
    let first_input = true;
    let checked = true;
    $('.adventure_level_input').each(function() {
        const name = <string>$(this).attr('adventure');
        if (name == adventure_name && $(this).is(":visible")) {
            if (first_input) {
                checked = $(this).prop("checked");
                first_input = false;
            }
            $(this).prop("checked", !checked);
        }
    });
}

export function enable_level(level: string) {
    markUnsavedChanges();
    // It is not selected yet -> select all and change color
    if ($('#level_button_' + level).hasClass('blue-btn')) {
        $('.adventure_level_' + level).each(function(){
            $(this).removeClass('hidden');
            if ($(this).is(':enabled')) {
                $(this).prop("checked", true);
            }
        });
        $('#level_button_' + level).removeClass('blue-btn');
        $('#level_button_' + level).addClass('green-btn');

        // We also have to add this level to the "Opening dates" section
        $('#opening_date_level_' + level).removeClass('hidden');
        $('#opening_date_level_' + level).find('input').val('');
        $('#opening_date_level_' + level).find('input').prop({type:"text"});
        $("#select-"+level).removeClass("hidden");
        let shown : boolean = false;
        $("div.adventures-tab").each(function() {
          if($(this).attr('style') === "display: flex;") {
            shown = true;
          }
        });
        // if no level is shown, it means current level was the one selected
        if (!shown) {
          $("#level-"+level).show({
            start: function() {
                $(this).css('display', 'flex');
            }
        });
        }
    } else {
        $('.adventure_level_' + level).each(function () {
            $(this).prop("checked", false);
            $(this).addClass('hidden');
        });
        $('#level_button_' + level).removeClass('green-btn');
        $('#level_button_' + level).addClass('blue-btn');
        // if this level was shown, hide it
        if($("#level-"+level).attr('style') === "display: flex;") {
          $("div.adventures-tab").hide();
        }
        $("#select-"+level).addClass("hidden");
        // We also have to remove this level from the "Opening dates" section
        $('#opening_date_level_' + level).addClass('hidden');
    }
}

export function add_account_placeholder() {
    let row = $("#account_row_unique").clone();
    row.removeClass('hidden');
    row.attr('id', "");
    // Set all inputs except class to required
    row.find(':input').each(function() {
       if ($(this).prop('id') != 'classes') {
           $(this).prop('required', true);
       }
    });
    // Append 5 rows at once
    for (let x = 0; x < 5; x++) {
        row.clone().appendTo("#account_rows_container");
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
                accounts.push(account);
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
                modal.alert(response.error, 3000, true);
                $('#account_rows_container').find(':input').each(function () {
                    if ($(this).val() == response.value) {
                        $(this).addClass('border-2 border-red-500');
                    }
                });
                return;
            } else {
                modal.alert(response.success, 3000, false);
                if ($("input[name='download_credentials_checkbox']:checked").val() == "yes") {
                    download_login_credentials(accounts);
                }
                $('#account_rows_container').find(':input').each(function () {
                   $(this).val("");
                });
            }
        }).fail(function (err) {
            modal.alert(err.responseText, 3000, true);
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
    modal.alert(success, 3000, false);
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

// Got from https://code-boxx.com/drag-drop-sortable-list-javascript/
export function drag_list (target: any) {
  let items = target.getElementsByTagName("div")
  let current : any = null;
  for (let i of items) {

    i.ondragstart = () => {
      current = i;
      for (let it of items) {
        if (it != current) { it.classList.add("drop-adventures-hint"); }
      }
    };

    i.ondragenter = () => {
      if (i != current) { i.classList.add("drop-adventures-active"); }
    };

    i.ondragleave = () => {
      i.classList.remove("drop-adventures-active");
    };

    i.ondragend = () => { for (let it of items) {
        it.classList.remove("drop-adventures-hint");
        it.classList.remove("drop-adventures-active");
    }};

    i.ondragover = (evt: any) => { evt.preventDefault(); };

    i.ondrop = (evt: any) => {
      evt.preventDefault();
      if (i != current) {
        let currentpos = 0, droppedpos = 0;
        for (let it=0; it<items.length; it++) {
          if (current == items[it]) { currentpos = it; }
          if (i == items[it]) { droppedpos = it; }
        }
        if (currentpos < droppedpos) {
          i.parentNode.insertBefore(current, i.nextSibling);
        } else {
          i.parentNode.insertBefore(current, i);
        }
      }
    };
  }
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
    modal.alert(ClientMessages.teacher_welcome);
  }
  if (options.tutorial) {
    startTeacherTutorial();
  }
}

/**
 * These will be copied into global variables, because that's how this file works...
 */
export interface InitializeCustomizeClassPageOptions {
  readonly page: 'customize-class';
  readonly available_adventures_level_translation: string;
  readonly teacher_adventures: TeacherAdventure[];
  readonly available_adventures: Record<string, AvailableAdventure[]>;
  readonly adventures_default_order: Record<string, string[]>;
  readonly adventure_names: Record<string, string>;
  readonly class_id: string;
}

let available_adventures_level_translation: string;
let teacher_adventures: TeacherAdventure[];
let available_adventures: Record<string, AvailableAdventure[]>;
let adventures_default_order: Record<string, string[]>;
let adventure_names: Record<string, string>;

export function initializeCustomizeClassPage(options: InitializeCustomizeClassPageOptions) {
  available_adventures_level_translation = options.available_adventures_level_translation;
  teacher_adventures = options.teacher_adventures;
  available_adventures = options.available_adventures;
  adventures_default_order = options.adventures_default_order;
  adventure_names = options.adventure_names;

  $(document).ready(function(){
      // Use this to make sure that we return a prompt when a user leaves the page without saving
      $( "input" ).on('change', function() {
        markUnsavedChanges();
      });

      $('#back_to_class').on('click', () => {
        function backToClass() {
            window.location.href = `/for-teachers/class/${options.class_id}`;
        }

        if (hasUnsavedChanges()) {
            modal.confirm(ClientMessages.unsaved_class_changes, () => {
                clearUnsavedChanges();
                backToClass();
            });
        } else {
            backToClass();
        }
      });

      drag_list(document.getElementById("sortadventures"));

      $('#adventures').on('change', function(){
          var level = $(this).val() as string;
          $("div.adventures-tab").hide();
          $("#level-"+level).show({
              start: function() {
                  $(this).css('display', 'flex');
              }
          });
          $('#available').empty();
          $('#available').append(`<option value="none" selected>${available_adventures_level_translation} ${level}</option>`);
          const adventures = available_adventures[level];
          for(let i = 0; i < adventures.length; i++) {
            $('#available').append(`<option id="remove-${adventures[i]['name']}" value="${adventures[i]['name']}-${level}-${adventures[i]['from_teacher']}">${adventure_names[adventures[i]['name']]}</option>`);
          }
          drag_list(document.getElementById("level-"+level));
      });

      $('#sortadventures').on('click', 'span', (function(event){
        event.preventDefault();
        const adventure = $(this).parent().attr('adventure') as string;
        const level = $(this).parent().attr('level') as string;
        const from_teacher = $(this).parent().attr('from-teacher') === "false" ? false : true;
        if (!available_adventures[level]) {
          throw new Error(`No available adventures for level ${JSON.stringify(level)}`);
        }
        available_adventures[level].push({"name": adventure, "from_teacher": from_teacher});
        $('#available').append(`<option id="remove-${adventure}" value="${adventure}-${level}-${from_teacher}">${adventure_names[adventure]}</option>`);
        $(this).parent().remove();
        markUnsavedChanges();
      }));

      $('#available').on('change', function(){
          const values = ($(this).val() as string).split('-');
          const adventure = values[0];
          const level = values[1]
          const from_teacher = values[2] === "true";
          // Note: this code is copy/pasted elsewhere in this file and also in customize-class.html. If you change it here, also change it there #}
          const adventure_div =
          `<div draggable="true" class="tab ${from_teacher ? 'teacher_tab' : ''} z-10 whitespace-nowrap flex items-center justify-left relative" tabindex="0" adventure="${adventure}" level="${level}" from-teacher="${from_teacher}">
              <span class="absolute top-0.5 right-0.5 text-gray-600 hover:text-red-400 fa-regular fa-circle-xmark" data-cy="hide"></span>
                  ${adventure_names[adventure]}
          </div>`;
          $('#level-'+level).append(adventure_div);
          const index = available_adventures[level].findIndex(a => a.name === adventure && a.from_teacher === from_teacher);
          available_adventures![level].splice(index, 1);
          $('#remove-'+adventure).remove();
          drag_list(document.getElementById("level-"+level));
          markUnsavedChanges();
      });
  });
}
