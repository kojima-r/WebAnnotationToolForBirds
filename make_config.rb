require "erb"
require 'hashie'
conf={
	tf:"microcone_geotf.zip",
	loc_src_num:1,
 loc_thresh:28,
 loc_lowest_freq:2400,
 sep_pause:1200,
 sep_min_interval:10,
 sep_lowest_freq:1000
}
config = Hashie::Mash.new conf

# テンプレートファイルを開く
#erb = Rails.root.join('config.sh.erb').read
puts ERB.new(File.read("config.sh.erb")).result(binding)


