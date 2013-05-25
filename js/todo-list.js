$(function(){
	var Project = Backbone.Model.extend({
		defaults: {
			project_name: '',
			displayNone: 'displayNone',
			displayBlock: 'displayBlock',
		},

		initialize: function(){
			if(!this.get('id')){
				this.set('id', this.get('cid'));
			}
		},

		clear: function(){
			this.destroy();
		}
	});

	var Task = Backbone.Model.extend({
		defaults: {
			name: '',
			checked: '',
			displayNone: 'displayNone',
			displayBlock: 'displayBlock',
			position: '',
		},

		initialize: function(){
		},

		clear: function(){
			this.destroy();
		}
	});

	var ProjectsCollection = Backbone.Collection.extend({
		model: Project,
		//url: '/get_projects',
		localStorage: new Store("getProjects"),
	});
	var ProjectsList = new ProjectsCollection;

	var TasksCollection = Backbone.Collection.extend({
		model: Task,
		//url: '/get_tasks',
		localStorage: new Store("getTasks"),
	});
	var TasksList = new TasksCollection;


	var ProjectView = Backbone.View.extend({

		initialize: function(){
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
			this.templateProject = _.template($('#project-template').html());

			TasksList.bind('reset', this.addAllTasks, this);
		},

		addOneTask: function(model){
			var	view = new TaskView({model:model});
			$(this.el).find("ul").append(view.render().el);
		},

		addAllTasks: function(){
			var arrayModels = TasksList.where({project_id: this.model.id});
			arrayModels = _.sortBy(arrayModels, function(model){return model.get("position")});
			for (key in arrayModels) {
				this.addOneTask(arrayModels[key]);
			};
		},

		updateTasks: function(){
			console.log(this);
		},

		render: function(){
			var renderProject = this.templateProject(this.model.toJSON());
			$(this.el).html(renderProject);
			$(this.el).addClass('project');
			this.addAllTasks(this);
			return this;
		},

		events: {
			"click .trash_head" : "clear",
			"click .pencil_head" : "edit",
			"dblclick .project_name" : "dbledit",
			"change input.input_name" : "edited",

			"click .create_task" : "create_task",
			"change input.input_task" : "create_task",
		},

		create_task: function(){
			var model = TasksList.create({
				name: this.$("input.input_task").val(),
				project_id: this.model.id,
				position: TasksList.where(({project_id: this.model.id})).length+1,
			});
			this.$("input.input_task").val('');
			this.addOneTask(model);
		},

		clear: function() {
			this.model.clear();
		},

		edit: function() {
			if("displayBlock" == this.model.get("displayBlock")){
				this.model.set({
					displayBlock: 'displayNone', 
					displayNone: 'displayBlock'
				});
			}
			else if("displayNone" == this.model.get("displayBlock")){
				this.model.set({
					displayBlock: 'displayBlock', 
					displayNone: 'displayNone'
				});
				this.model.save();			
			}
		},

		dbledit: function() {
			this.model.set({
				displayBlock: 'displayNone', 
				displayNone: 'displayBlock'
			});
		},

		edited: function(e) {
			this.model.set({
				displayBlock: 'displayBlock', 
				displayNone: 'displayNone', 
				project_name: $(e.currentTarget).val()
			});
			this.model.save();
		},
	});

	var TaskView = Backbone.View.extend({
		tagName: "li",

		initialize: function(){
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);

			this.templateTask = _.template($('#task-template').html());
		},

		render: function(){
			var renderTask = this.templateTask(this.model.toJSON());
			$(this.el).html(renderTask);
			$(this.el).addClass('task');
			return this;
		},

		events: {			
			"click .option_trash" : "clear",
			"click input[name=checkbox]": "checked",

			"click .option_edit" : "edit",
			"dblclick .task_body" : "dbledit",
			"change input.edit_task" : "edited",
			"click .sotr_up" : "sortUp",
			"click .sotr_down" : "sortDown",
		},

		sortUp: function(){
			var arrayModels = TasksList.where({project_id: this.model.get("project_id")});
			arrayModels = _.sortBy(arrayModels, function(model){return model.get("position")});
			for(i=0; arrayModels.length > i ; ++i){
				if(arrayModels[i].get("position") === this.model.get("position")){

					var tempPosition = arrayModels[i-1].get("position");
					arrayModels[i-1].set({position: this.model.get("position")});
					arrayModels[i].set({position: tempPosition});
					arrayModels[i-1].save();
					arrayModels[i].save();

					// getting model project in 
					model = ProjectsList.get(this.model.get("project_id"));
					model.set({time: new Date().getTime()});
				}
			}
		},

		sortDown: function(){
			var arrayModels = TasksList.where({project_id: this.model.get("project_id")});
			arrayModels = _.sortBy(arrayModels, function(model){return model.get("position")});
			for(i=0; arrayModels.length > i ; ++i){
				if(arrayModels[i].get("position") === this.model.get("position")){

					var tempPosition = arrayModels[i+1].get("position");
					arrayModels[i+1].set({position: this.model.get("position")});
					arrayModels[i].set({position: tempPosition});
					arrayModels[i+1].save();
					arrayModels[i].save();

					model = ProjectsList.get(this.model.get("project_id"));
					model.set({time: new Date().getTime()});
				}
			}
		},

		edit: function() {
			if("displayBlock" == this.model.get("displayBlock")){
				this.model.set({
					displayBlock: 'displayNone', 
					displayNone: 'displayBlock'
				});
			}
			else if("displayNone" == this.model.get("displayBlock")){
				this.model.set({
					displayBlock: 'displayBlock', 
					displayNone: 'displayNone'
				});
				this.model.save();	
			}
		},
		dbledit: function() {
			this.model.set({
				displayBlock: 'displayNone', 
				displayNone: 'displayBlock'
			});
		},
		edited: function(e) {
			this.model.set({
				displayBlock: 'displayBlock', 
				displayNone: 'displayNone', 
				name: $(e.currentTarget).val()
			});
			this.model.save();
		},
		clear: function() {
			this.model.clear();
		},

		checked: function() {
			if('checked' == this.model.get('checked')){
				this.model.set({
					checked: ''
				});		
			}
			else {
				this.model.set({
					checked: 'checked'
				});				
			}
			this.model.save();
		},
		
	});

	var AppView = Backbone.View.extend({
		el: $('body'),

		initialize: function(){
			ProjectsList.bind('add', this.addOne, this);
			ProjectsList.bind('reset', this.addAll, this);

			ProjectsList.fetch();
			TasksList.fetch();
		},

		events: {
			"click #create_project": "createProject",
		},

		addOne: function(Project){
			var	stView = new ProjectView({model:Project});
			$('#content').append(stView.render().el);
		},
		addAll: function(){
			ProjectsList.each(this.addOne);
		},

		createProject: function(){
			ProjectsList.create({displayBlock: 'displayNone', displayNone: 'displayBlock'});
		},
	});

	App = new AppView;
});