import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import PostsService from './posts.service';
import CreatePostDto from './dto/createPost.dto';
import UpdatePostDto from './dto/updatePost.dto';
import { JwtAuthenticationGuard } from '../authentication/jwtAuthentication.guard';

@Controller('posts')
export default class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	getAllPosts() {
		return this.postsService.getAllPosts();
	}

	@Get(':id')
	getPostById(@Param('id') id: string) {
		return this.postsService.getPostById(Number(id));
	}

	@Post()
	@UseGuards(JwtAuthenticationGuard)
	async createPost(@Body() post: CreatePostDto) {
		return this.postsService.createPost(post);
	}

	@Patch(':id')
	@UseGuards(JwtAuthenticationGuard)
	async updatePost(@Param('id') id: string, @Body() post: UpdatePostDto) {
		return this.postsService.updatePost(Number(id), post);
	}

	@Delete(':id')
	@UseGuards(JwtAuthenticationGuard)
	async deletePost(@Param('id') id: string) {
		return this.postsService.deletePost(Number(id));
	}
}
