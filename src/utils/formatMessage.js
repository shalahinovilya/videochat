import moment from "moment";

export function formatMessage (message, username) {
    return {content: message, time: moment().format('h:mm a'), username}
}