Meteor.methods({
	spotlight: function(text, usernames, type = {users: true, rooms: true}) {
		const result = {
			users: [],
			rooms: []
		};

		const roomOptions = {
			limit: 5,
			fields: {
				t: 1,
				name: 1
			},
			sort: {
				name: 1
			}
		};

		const userOptions = {
			limit: 5,
			fields: {
				username: 1,
				status: 1
			},
			sort: {
				username: 1
			}
		};

		const regex = new RegExp(s.trim(s.escapeRegExp(text)), 'i');

		if (this.userId == null) {
			if (RocketChat.settings.get('Accounts_AllowAnonymousAccess') === true) {
				result.rooms = RocketChat.models.Rooms.findByNameAndType(regex, 'c', roomOptions).fetch();
			}
			return result;
		}

		if (type.users === true && RocketChat.authz.hasPermission(this.userId, 'view-d-room')) {
			result.users = RocketChat.models.Users.findByActiveUsersUsernameExcept(text, usernames, userOptions).fetch();
		}

		if (type.rooms === true && RocketChat.authz.hasPermission(this.userId, 'view-c-room')) {
			const username = RocketChat.models.Users.findOneById(this.userId, {
				username: 1
			}).username;

			result.rooms = RocketChat.models.Rooms.findByNameAndTypeNotContainingUsername(regex, 'c', username, roomOptions).fetch();
		}
		return result;
	}
});

DDPRateLimiter.addRule({
	type: 'method',
	name: 'spotlight',
	userId(/*userId*/) {
		return true;
	}
}, 100, 100000);