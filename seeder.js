const faker = require('faker');
const fs = require('fs');
const bcrypt = require('bcrypt');

const createProfessions = (total) => {
  let professions = [];

  for (let i = 0; i < total; i++) {
    professions.push({
      title: `${faker.name.jobTitle()}`,
    });
  }

  return professions;
};

const createProfile = async (professionCount) => {
  const types = ['Personal', 'Creator', 'Business'];
  const profileType = types[Math.floor(Math.random() * 3)];

  const saltRounds = 10;
  const password = await bcrypt.hash(faker.internet.password(), saltRounds);

  let user = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    mobile_number: faker.phone.phoneNumber('0##########'),
    password,
    profile_type: profileType,
    private: 1,
    full_name: faker.name.findName(),
    verified: Math.random() >= 0.9 ? 1 : 0,
    bio: faker.lorem.sentences(2),
    website: faker.internet.domainName(),
    profile_pic_url: faker.image.people(300, 300),
    profession: null,
    business_email: null,
    business_phone: null,
    zip_code: null,
    city: null,
  };

  if (user.profile_type !== 'Personal') {
    user = {
      ...user,
      profession: Math.floor(Math.random() * professionCount) + 1,
      business_email: faker.internet.email(),
      business_phone: faker.phone.phoneNumber('0##########'),
      zip_code: faker.address.zipCode(),
      city: faker.address.city(),
      private: 0,
    };
  }

  return new Promise((res) => {
    res(user);
  });
};

const createProfiles = (quantity, professionCount) => {
  const users = Array(quantity).fill();

  return Promise.all(
    users.map(() => {
      return createProfile(professionCount);
    }),
  );
};

const createFollowers = (profileCount) => {
  const followers = [];

  // Loop through all users
  for (let i = 1; i <= profileCount; i++) {
    // Determine amount of users this user will be followed by
    const followedCount = Math.floor(Math.random() * profileCount);

    // Check profile is being followed
    if (followedCount !== 0) {
      // Temp array that stores profiles already following the primary profile
      const followedBy = [];

      let j = 1;

      while (j <= followedCount) {
        // Select a random profile that will become follower
        const follower = Math.floor(Math.random() * profileCount) + 1;

        // Check profile isn't attempting to follow self and isn't already being followed by same profile
        if (i !== follower && !followedBy.includes(follower)) {
          followedBy.push(follower);

          followers.push({
            profile_id: i,
            follower_id: follower,
            follow_date: faker.date.between('2010-01-01', '2020-11-24'),
          });

          j++;
        }
      }
    }
  }

  return followers;
};

const createPosts = (profileCount, limit) => {
  let posts = [];

  for (i = 1; i <= profileCount; i++) {
    // Number of posts user will create
    const totalPosts = Math.floor(Math.random() * (limit + 1));

    // Check user if creates posts
    if (totalPosts !== 0) {
      for (j = 1; j <= totalPosts; j++) {
        // Generate fake date
        const createdAt = faker.date.between('2010-01-01', '2020-11-23');

        // 10% chance of post being updated
        const wasPostUpdated = Math.random() > 0.9;

        // Generate post object
        const post = {
          profile_id: i,
          image_path: faker.random.image(),
          caption: faker.random.words(),
          location: faker.address.city(),
          created_at: faker.date.between('2010-01-01', '2020-11-23'),
          updated_at: wasPostUpdated
            ? faker.date.between(createdAt, '2020-11-23')
            : null,
        };

        // add post to post table
        posts.push(post);
      }
    }
  }

  // Return posts sorted by date ascending
  return posts.sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
};

const createComments = (profile_count, postCount, limit) => {
  const comments = [];

  // Loop through all users
  for (let i = 1; i <= profile_count; i++) {
    const totalComments = Math.floor(Math.random() * (limit + 1));

    for (let j = 1; j <= totalComments; j++) {
      // Select a random post to comment on
      const post = Math.floor(Math.random() * postCount) + 1;

      // Generate comment date
      const comment = {
        profile_id: i,
        post_id: post,
        content: `${faker.commerce.productAdjective()} ${faker.lorem.sentence()}`,
        comment_date: faker.date.recent(10),
      };

      // Add comment
      comments.push(comment);
    }
  }

  return comments.sort((a, b) => {
    return (
      new Date(a.comment_date).getTime() - new Date(b.comment_date).getTime()
    );
  });
};

const generateData = (profileCount, professionCount) => {
  const professions = createProfessions(professionCount);
  fs.writeFileSync('data/professions.json', JSON.stringify(professions));

  createProfiles(profileCount, professions.length).then((profiles) => {
    fs.writeFileSync('data/profiles.json', JSON.stringify(profiles));

    const followers = createFollowers(profiles.length);
    fs.writeFileSync('data/followers.json', JSON.stringify(followers));

    const posts = createPosts(profiles.length, 25);
    fs.writeFileSync('data/posts.json', JSON.stringify(posts));

    const comments = createComments(profiles.length, posts.length, 30);
    fs.writeFileSync('data/comments.json', JSON.stringify(comments));
  });
};

generateData(10, 10);
