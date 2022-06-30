import * as Pusher from "pusher";

// initialize pusher

const pusher = new Pusher({
    appId: "1427475",
    key: "954a7749cd3e64c24ce7",
    secret: "b0e674b477b27237eb8e",
    cluster: "us2",
    useTLS: true
});

export default pusher;