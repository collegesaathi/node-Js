const prisma = require("../config/prisma");

module.exports = {
  profile: async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, full_name: true, email: true, role_id: true }
    });

    res.json({ user });
  }
};
