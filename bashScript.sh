#!/bin/bash

node technicalAssessmentScript.js $1 > text.txt
head -5 text.txt
rm text.txt
