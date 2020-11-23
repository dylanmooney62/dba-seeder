const faker = require('faker');
const fs = require('fs');
const bcrypt = require('bcrypt');

const createUser = async () => {
  const types = ['Personal', 'Creator', 'Business'];
  const totalProfessions = 20;
  const saltRounds = 10;

  const type = types[Math.floor(Math.random() * 3)];

  const plainTextPassword = faker.internet.password();

  let user = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    mobile_number: faker.phone.phoneNumber('0##########'),
    profile_type: type,
    private: 1,
    full_name: faker.name.findName(),
    verified: Math.random() >= 0.7 ? 1 : 0,
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
      profession: Math.floor(Math.random() * totalProfessions),
      business_email: faker.internet.email(),
      business_phone: faker.phone.phoneNumber('0##########'),
      zip_code: faker.address.zipCode(),
      city: faker.address.city(),
      private: 0,
    };
  }

  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

  user.password = hashedPassword;

  return new Promise((res, rej) => {
    res(user);
  });
};

const createUsers = (quantity) => {
  const users = Array(quantity).fill();

  return Promise.all(
    users.map(() => {
      return createUser();
    }),
  );
};

createUsers(10).then((users) =>
  fs.writeFileSync('users.json', JSON.stringify(users)),
);
