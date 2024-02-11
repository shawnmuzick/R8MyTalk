/* If the user is authenticated, proceed to the next middleware or route handler
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

/**A simple logger middleware */
export function logger(req, res, next) {
  console.log("this is the logger");
  next();
}
