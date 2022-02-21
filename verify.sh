#!/bin/sh

EXPECTED_LENGTH=$(cat $1 | jq '.headings | length')

WORD_LENGTHS=$(cat $1 | jq '.words | .[] | .cases | length')

for length in $WORD_LENGTHS
do
  if [ "$length" != "$EXPECTED_LENGTH" ]; then
    echo "Invalid!"
  fi
done
