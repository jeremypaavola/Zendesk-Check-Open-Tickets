// ==UserScript==
// @name         Zendesk Check Open Tickets
// @namespace    http://tampermonkey.net/
// @version      0.98.1
// @description  Checks if this user has OPEN/PENDING/ON-HOLD/NEW tickets and will display a notification at the top if they do
// @updateURL    https://github.com/senff/Zendesk-Check-Open-Tickets/raw/master/zendesk-check-open-tickets.user.js
// @author       Senff, modified by Jeremy Paavola
// @match        https://*.zdusercontent.com/*
// @grant        none
// ==/UserScript==

const $ = window.jQuery;

function checkTickets() {
    let nudgeNudge;
    let winkWink = 0;
    let goThruTix = setInterval(function () {
        if ($('body').hasClass('saynoMORE')) {
            clearInterval(goThruTix);
        } else {
            if ($('.type-Zendesk_History').length) {
                const mainURL = ( window.location !== window.parent.location )
                    ? document.referrer
                    : document.location.href;
                const URLdivider = mainURL.split('/');
                const thisTicket = URLdivider.pop();
                const thisUser = $('.user__info .user__info-row:first-child .value').text();
                $('#support__history-content .type-Zendesk_History').each(function (ticket) { // Looping through this user's list of tickets
                    const ticketLine = $(this).find('.subject a').html();
                    const ticketNoLong = ticketLine.substring(ticketLine.indexOf("#") + 1); // Remove first character
                    const ticketNo = ticketNoLong.substring(0, ticketNoLong.indexOf(' - ')); // Remove everything after first space
                    if ( ticketNo !== thisTicket ) {
                        // This entry is not the ticket we're looking at
                        if (($(this).hasClass('status-Open')) || ($(this).hasClass('status-Pending')) || ($(this).hasClass('status-Hold')) || ($(this).hasClass('status-New'))) { // There's other tickets, aside from this one
                            winkWink = winkWink + 1;
                        }
                    } else {
                        $(this).addClass('this-ticket');
                    }
                });
                if (winkWink > 0) {
                    $('body').addClass('saynoMORE');
                    nudgeNudge = `
                        <div class='nudgeNudge'>
                            <span style='font-size:18px;'>⚠️</span>
                                <span class='whatsItLike'>
                                    <strong>This user has other/open pending tickets!</strong>
                                    Please check those first before you reply here.
                                </span>
                                &nbsp;&nbsp;&nbsp;
                                <span class='cool'>Cool, got it.</span>
                        </div>`;
                    $(nudgeNudge).prependTo('body');
                    var nudgeHeight = $('.nudgeNudge').outerHeight() + 5;
                    $('body').css('padding-top', nudgeHeight + 'px');
                }
                $('body').addClass('saynoMORE');
            }
        }

    }, 1000);
}

$('body').on('click','.nudgeNudge .cool',function(){
    $('.nudgeNudge .cool').html('Baiiiiiiiiii');
    $('.nudgeNudge').fadeOut(500);
    $('body').removeClass('saynoMORE').animate({padding: 0}, 800, function() {});
});

function duplicateNoticeStyles() {
    const styles = document.createElement( 'style' );
    styles.innerHTML = `
    
        .nudgeNudge { 
            box-sizing: border-box;
            position: fixed;
            width: 100%;
            top:0;
            z-index: 100;
            background: #D8456E;
            color: #ffffff;
            padding: 7px 10px 10px;
            line-height: 20px;
        }
        .nudgeNudge .cool { 
            color: #FBD45E; 
            font-weight: bold;
            text-decoration:underline;
            cursor: pointer;
        }
        .this-ticket td { 
            background: #e7e7e7 !important; 
            filter: grayscale(100%);
        }
        .this-ticket td:first-child {
            border-left: solid 1px #cccccc;
        }
        .this-ticket td.subject a,
        .this-ticket td.when {
            cursor: default;
            pointer-events: none;
            color: #888888 !important;
            text-shadow: 1px 1px 0 #ffffff;
            font-style: italic;
            font-size: 12px;
        }
    `;
    document.head.appendChild( styles );
}

$(document).ready(function() {
    duplicateNoticeStyles();
    checkTickets();
});
