## Data Import Profiles

To test different scenarios of data we can get from the Data Import service, we have created **data import profiles**. "Marge" is the default **profile**. 

## How do I test with these profiles?

**If you are a developer:**
1. Have the app running locally and go to the account page: http://localhost:3000/df/file/account/
2. Select Data Import Profile to show all the profiles.
3. Click on "Reset your account and use profile: [profile name]"
4. Click on "start a new return" from that same profile.
5. Go home and use DF: http://localhost:3000/df/file/home/

## Why do we have Simpsons characters for profiles?

Because they are fun.

## What do they do?

Here are some basic features of each profile as of Jan 16, 2025:

### Marge
Features:
- Complete About You data 
- Has IP PIN
- Has 1 W2 from SPRINGFIELD ATOMIC POWER AND LIGHT

### Marge with only SADI success
Features:
- Complete About You data 
- Error for IP PIN
- Error for W2s

### Bart, Lisa
Features:
- Complete About You data 
- No IP PIN
- Has 1 W2 from Goods and Stuff

### Homer
Features:
- Complete About You data 
- No IP PIN
- Has 1 W2 from SPRINGFIELD ATOMIC POWER AND LIGHT

### Lisa Knockout
Features:
- Complete About You data 
- No IP PIN
- Has 1 W2 from Goods and Stuff with KO for Box 13 - Statutory Employee

### Grandma
Features:
- Complete About You data 
- No IP PIN
- Has 1 W2 from Goods and Stuff

### Abe
Features:
- Complete About You data 
  - Mailing address and street address
  - Street address has '.' and '&' in it
- Incomplete IP PIN
- Has 5 W2s

### December 27
- Complete About you data
- Has IP PIN
- Incomplete W2s

### Jon
- Complete About you data
  - Made to test a really long name: "Johnjacobjingleheimer Kleinschmidtingtonheimer"
- Error for IP PIN and W2s

### Kent
- Complete About you data
  - Made to test symbols in the name fields "_" and "$"
- No IP PIN
- Has 1 W2 from Channel 5

### Krusty
- Complete About you data
- No IP Pin
- Has 2 W2s that trigger all possible KOs from Data Import

### Milhouse
- Complete About you data with the email "thrillhouse@gmail.com" which is pretty cool, I mean objectively speaking
- No IP Pin
- Has 2 W2s from Goods and Stuff and Kwiki Mart

### Ned
- Complete About you data 
- No IP Pin
- Has a W2 from Goods and Stuff with an employee address different from the filer's address in about you
- Has 1099 int

### Owen
- Complete about you data from Shmowen Shmoutts, made to test the null mailing address bug
- Has IP Pin
- Incomplete W2

### Sean
- Complete About you data 
- No IP Pin
- Has 1 W2 from SPEEDWAY

### Sideshow Bob
- About you data but without email
- No IP Pin
- No W2s

### Rod
- KO 1099-INT

### Maude
- 6 1099-INTs

### Ned
- 1 1099-INT

## Fact Graph Shortcuts

Don't want to fill out all of Direct File just to test a data import feature? Here are some pre-made FactGraphs that get you to various sections:

### 1099-INT 
- Rod profile FG:[rod_1099_ko.json](uploads/95c1bfab5d7de7db1e5ce66c8eabff52/rod_1099_ko.json)
- Maude profile FG:[maude_1099-ints.json](uploads/eae401f1c2836421f395f6edf086b329/maude_1099-ints.json)
- Ned profile FG:[ned_1099_ints.json](uploads/59cca7745f4029ce0e20ff34674a0fc4/ned_1099_ints.json)

