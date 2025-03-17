#!/bin/bash

cd myapp

pip install -r requirements.txt

cd ../

python manage.py makemigrations

python manage.py migrate

python manage.py runserver
