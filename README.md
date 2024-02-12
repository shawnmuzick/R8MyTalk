# CS510Project

## About
This project is for Parents2Partners, developed by students of CCSU. This project is intended to be iterated on through multiple classes of student developers. This repo is a fork of the previous development team. Their upstream code base can be found here: https://github.com/Gulloje/R8MyTalkGulloje/R8MyTalk

If you are a future developer of this project, please fork this repo and continue development. There is no need to submit your changes upstream to this repo, though feel free to reach out to us with questions about the project. The previous developer provided us with a word document user manual that we will share with you.

## Prerequisites
- install nodejs LTS v20 for your platform via https://nodejs.org/en/download/

## Build a dev environment
Follow these steps to set up a local development environment:
- create a folder that you want to use as your project directory
- cd to your project directory in a terminal
- clone the repo
```
git clone https://github.com/shawnmuzick/R8MyTalk.git
```
- dump the env file into the root of the cloned project, on the same level as this readme. Make sure the file is named ".env", if it is not.
- run the command to install the packages for the project:
```javascript
npm install
```
- when the dependencies are finished installing, you can invoke node from a terminal and call the main application entry point:
```javascript
node index.js  
```
- the application will run on port 3000, by default. View the running application in your browser at localhost:3000

## Contributing

### Branching Strategy
We will follow a conventional branching strategy:
```
main
|
- dev
|	|
|	- feat-{nameOfFeature}
|	- feat-{nameOfFeature}
|	- feat-{nameOfFeature}
|
- hotfix
```
When implementing a new feature, please create a branch from dev named as "feat-{nameOfFeature}". When the feature is complete, please submit a pull request into dev. The code will be reviewed and merged pending approval. 

Main will be linked with the production environment.

### Commit Messages
Please use conventional message prefixes:
```
feat		– new feature
fix			– bug fix
chore		– bump dependencies, update docs, etc
refactor	– refactoring code
test 		– create new tests or fix existing ones
revert 		– revert some previous commit
```

## Todo
- check for breaking changes in package "open" from v9 to v10
- Fix download functionality
- Upload a new logo that their team is designing 
- Convert the black background into white with black text for ease of navigation 
- Create a method to generate a downloadable report of attendee feedback 
- Allow for the speaker to create a profile that includes a photograph and adding social media 
- Allow the app to generate a list of emails, saved for each event. 

## Doing
- create docs
- bump deps

## Done
- remove passport.js dependencies