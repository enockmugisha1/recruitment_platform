#!/bin/bash

read -p "Enter the name of the sumbissions directory: "
file1="submission1.txt
file2="submission2.txt"
if [[ -d "$dir" ]]; then
        echo "Directory '$dir' already exists."
        echo "Creating files inside the exisitng directory..."
        touch "$dir/$file1" "$dir/$file2"
        echo "Files '$file1' and '$file2' created successfully in '$dir'."
elif [[ -f "$dir" ]]; then
        echo "A file named '$dir' already exists. Cannot create a directory."
else
        echo "Directory '$dir' does not exist. Creating it now..."
        mkdir "$dir"
        touch "$dir/$file1" "$dir/$file2"
        echo "Directory and files created successfully."
        fi

~                         