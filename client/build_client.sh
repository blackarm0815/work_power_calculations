echo
echo "eslint client.ts"
if npx eslint client.ts
then
  echo "done"
else
  exit
fi
echo
#
echo "transpiling client.ts"
if npx tsc
then
  echo "done"
else
  exit
fi
echo
# make client code with servicenow weirdness
echo "making widget_client.js"
echo "function main(spUtil) {" > ../widget_client.js
grep -Ev 'use strict|ts-ignore' < client.js | sed 's/    /  /g' | sed 's/^/  /' >> ../widget_client.js
echo "}" >> ../widget_client.js
echo "done"
echo