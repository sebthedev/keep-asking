$(function () {
  $('.tokenfield').on('tokenfield:createtoken', function (e) {
    e.attrs.value = e.attrs.value.toLowerCase()
    e.attrs.label = e.attrs.label.toLowerCase()
  }).on('tokenfield:createdtoken', function (e) {
    // Über-simplistic e-mail validation
    var re = /\S+@\S+\.\S+/
    if (!re.test(e.attrs.value)) {
      $(e.relatedTarget).addClass('invalid')
    }
  }).tokenfield({
    delimiter: [',', ' ', '\n', '\t', ';'],
    createTokensOnBlur: true
  })

  $('#newCohortForm').submit(function (event) {
    event.preventDefault()

    $('.is-invalid').removeClass('is-invalid')
    $('#cohortNameHelp').addClass('text-muted').removeClass('text-danger')
    $('#cohortMemberEmailsHelp').addClass('text-muted').removeClass('text-danger')

    let cohortMemberEmails = $('#cohortMemberEmails').tokenfield('getTokens').map(function (val) {
      return val.value
    })

    let cohortData = {
      name: $('#cohortName').val(),
      members: cohortMemberEmails
    }

    if ($(this).data('cohort-id')) {
      cohortData.id = $(this).data('cohort-id')
    }

    $.post('/api/cohorts/update', cohortData).done(function () {
      window.location.href = '/'
    }).fail(function (err) {
      if (err && err.status === 400) {
        if (err.responseJSON) {
          console.log('switching')
          switch (err.responseJSON.invalidField) {
            case 'name':
              $('#cohortName').addClass('is-invalid')
              $('#cohortNameHelp').removeClass('text-muted').addClass('text-danger')
              break
            case 'members':
              alert('members')
              $('#cohortMemberEmails').addClass('is-invalid')
              $('#cohortMemberEmailsHelp').removeClass('text-muted').addClass('text-danger')
              break
            default:
              window.alert('Sadface')
          }
        }
      }
      console.log(err)
    })
  })

  // $('a.delete-cohort').click(function () {
  //
  // })
})
