/**If the user is authenticated, proceed to the next middleware or route handler
 * If the user is not authenticated, redirect to the login page or any other page
 * Change '/login' to the appropriate login route
 */
export function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

/** This middleware renders a 404 page if no other middleware responded */
export function pageNotFound(req, res, next) {
  const user = req.session.user ?? null;
  res.status(404);
  res.render("404", { user: user, error: null });
  next();
}
