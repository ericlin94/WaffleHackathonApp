# WaffleHackathonApp

A github extensions build by probot

# Getting Start
Before running the app, you will need to install the required dependecies, you can do it by :

 ```
  npm install
```
Run the program: 
 ```
 npm run dev 
```

# Functionalities

I) close duplicated issues 

II) When there's a pull request, if the title don't have correct format, it will not pass, for correct formating, see below:

<strong>Pull Request Title Prefix</strong><br>
  "fix" - fix the bug<br>
  "feat" - new feature<br>
  "docs" - document<br>
  "style" - coding style change<br>
  "close" - close the issue<br>
  "release" - release the new update<br>
  "test" - test the code<br><br>
<strong>Note:</strong> pull request must follow the format with these prefix follw by : ex. fix:[title], ortherwise the request check can cause error.

III)Find the similar issue when you create new issue:
first create first issue, then create second issue with similar content.
So it will show up that there is a similar issue to the one you just create.
