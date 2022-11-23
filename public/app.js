
// Source for .env in Vue: https://hackernoon.com/how-to-use-env-environment-variables-in-vue

const pusher = new Pusher('957e9dc4041b3817ed2f', {
    cluster: 'eu',
    encrypted: true,
    authEndpoint: 'pusher/auth'
});

const app = new Vue({
    el: '#app',
    data: {
        joined: false,
        username: '',
        members: '',
        newMessage: '',
        messages: [],
        status: ''
    },
    methods: {
        joinChat() {
            axios.post('join-chat', {username: this.username})
            .then(response => {
                this.joined = true;
                const channel = pusher.subscribe('presence-groupChat');
                // User has joined the chat (Listen to the event "pusher:subscription_succeeded")
                channel.bind('pusher:subscription_succeeded', (members) => {
                    this.members = channel.members;
                });
                // User joins chat (Listen to the event "pusher:member_added")
                channel.bind('pusher:member_added', (member) => {
                    this.status = `${member.id} joined the chat`;
                });
                // Listen for chat messages
                this.listen();
            });
        },
        sendMessage() {
            let message = {
                username: this.username,
                message: this.newMessage
            }
            // Clear input field
            this.newMessage = '';
            axios.post('/send-message', message);
        },
        listen() {
            const channel = pusher.subscribe('presence-groupChat');
            // Listen to the event "message_sent"
            channel.bind('message_sent', (data) => {
                this.messages.push({
                    username: data.username,
                    message: data.message
                });
            });
        }
    }
});

