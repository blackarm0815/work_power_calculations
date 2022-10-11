echo
#
echo "eslint server.ts"
if npx eslint server.ts
then
  echo "done"
else
  exit
fi
echo
#
echo "transpiling server.ts"
if npx tsc server.ts
then
  echo "done"
else
  exit
fi
echo
# make server code with servicenow weirdness
echo "making widget_server.js"
echo "(function () {" > ../widget_server.js
grep -Ev 'use strict|ts-ignore' < server.js | sed 's/    /  /g'  | sed 's/^/  /' >> ../widget_server.js
echo "})();" >> ../widget_server.js
echo "done"
echo