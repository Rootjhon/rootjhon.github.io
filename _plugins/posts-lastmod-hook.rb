#!/usr/bin/env ruby
#
# Check for changed posts

# Jekyll::Hooks.register :posts, :post_init do |post|

#   commit_num = `git rev-list --count HEAD "#{ post.path }"`

#   if commit_num.to_i > 1
#     lastmod_date = `git log -1 --pretty="%ad" --date=iso "#{ post.path }"`
#     post.data['last_modified_at'] = lastmod_date
#   end

# end

Jekyll::Hooks.register :posts, :post_init do |post|

  # Get all commit dates for the file
  commit_dates = `git log --pretty=format:%ad --date=iso "#{post.path}"`.split("\n")

  # Sort commit dates in descending order
  sorted_commit_dates = commit_dates.sort { |a, b| b <=> a }

  # Only keep the latest 10 commit dates
  latest_commit_dates = sorted_commit_dates.take(10)

  # Add sorted commit dates to post metadata
  post.data['last_modified_at'] = latest_commit_dates

end
