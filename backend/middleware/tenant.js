const attachTenant = (req, res, next) => {
  if (!req.user || !req.user.businessId) {
    return res.status(401).json({ message: "Business context missing" });
  }

  req.businessId = req.user.businessId;
  next();
};

module.exports = attachTenant;