@REM bundle exec htmlproofer _site --disable-external --allow-hash_href --trace --ignore-urls "/^http:\/\//" --checks html
bundle exec htmlproofer _site --disable-external --check-html --allow_hash_href --trace
pause