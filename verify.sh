#!/bin/sh

for filename in public/*.json
do
  EXPECTED_LENGTH=$(cat $filename | jq '.headings | length')

  WORD_LENGTHS=$(cat $filename | jq '.words | .[] | .cases | length')

  for length in $WORD_LENGTHS
  do
    if [ "$length" != "$EXPECTED_LENGTH" ]; then
      echo "Invalid!"
    fi
  done
done
